package com.quickship.service;

import com.quickship.dto.ParcelResponse;
import com.quickship.dto.StatusUpdateRequest;
import com.quickship.entity.*;
import com.quickship.exception.BadRequestException;
import com.quickship.exception.ResourceNotFoundException;
import com.quickship.exception.UnauthorizedException;
import com.quickship.mapper.ParcelMapper;
import com.quickship.repository.DeliveryLogRepository;
import com.quickship.repository.ParcelRepository;
import com.quickship.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeliveryLogRepository deliveryLogRepository;

    @Autowired
    private ParcelMapper parcelMapper;

    @Autowired
    private NotificationService notificationService;

    public List<ParcelResponse> getAssignedParcels(String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Livreur non trouvé"));
        return parcelRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId()).stream()
                .map(parcelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ParcelResponse updateParcelStatus(Long parcelId, StatusUpdateRequest request, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Livreur non trouvé"));
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new ResourceNotFoundException("Colis non trouvé avec l'id : " + parcelId));

        if (parcel.getDriver() == null || !parcel.getDriver().getId().equals(driver.getId())) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à modifier le statut de ce colis");
        }

        ParcelStatus newStatus;
        try {
            newStatus = ParcelStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Statut invalide. Choisissez entre WAITING_PICKUP, PICKED_UP, IN_EXPEDITION, SECOND_CALL, UNREACHABLE, REFUSED, RETURN_TO_CLIENT, RETURN_TO_STOCK ou DELIVERED");
        }

        parcel.setStatus(newStatus);
        Parcel savedParcel = parcelRepository.save(parcel);

        String logDescription = request.getDescription();
        if (logDescription == null || logDescription.isEmpty()) {
            switch (newStatus) {
                case WAITING_PICKUP: logDescription = "Le colis est en attente de ramassage."; break;
                case PICKED_UP: logDescription = "Le colis a été ramassé."; break;
                case IN_EXPEDITION: logDescription = "Le colis est en cours d'expédition."; break;
                case SECOND_CALL: logDescription = "Deuxième appel planifié pour le destinataire."; break;
                case UNREACHABLE: logDescription = "Le destinataire est injoignable."; break;
                case REFUSED: logDescription = "Le colis a été refusé par le destinataire."; break;
                case RETURN_TO_CLIENT: logDescription = "Le colis est en retour au client."; break;
                case RETURN_TO_STOCK: logDescription = "Le colis est retourné au stock."; break;
                case DELIVERED: logDescription = "Le colis a été livré."; break;
                default: logDescription = "Statut mis à jour : " + newStatus.name();
            }
        }

        DeliveryLog log = DeliveryLog.builder()
                .status(newStatus)
                .description(logDescription)
                .parcel(savedParcel)
                .build();
        deliveryLogRepository.save(log);

        // Send notifications to client on status changes
        if (newStatus == ParcelStatus.PICKED_UP) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " a été ramassé.");
        } else if (newStatus == ParcelStatus.IN_EXPEDITION) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " est en cours d'expédition.");
        } else if (newStatus == ParcelStatus.SECOND_CALL) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Deuxième appel pour votre colis " + savedParcel.getTrackingId() + ".");
        } else if (newStatus == ParcelStatus.UNREACHABLE) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Destinataire injoignable pour le colis " + savedParcel.getTrackingId() + ".");
        } else if (newStatus == ParcelStatus.REFUSED) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " a été refusé.");
        } else if (newStatus == ParcelStatus.RETURN_TO_CLIENT) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " est en retour au client.");
        } else if (newStatus == ParcelStatus.RETURN_TO_STOCK) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " est retourné au stock.");
        } else if (newStatus == ParcelStatus.DELIVERED) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " a été livré !");
        }

        return parcelMapper.toResponse(savedParcel);
    }
}
