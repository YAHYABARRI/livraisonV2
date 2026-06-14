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
            throw new BadRequestException("Statut invalide. Choisissez entre ACCEPTED, PICKED_UP, IN_TRANSIT, ARRIVED_AT_HUB, OUT_FOR_DELIVERY ou DELIVERED");
        }

        parcel.setStatus(newStatus);
        Parcel savedParcel = parcelRepository.save(parcel);

        String logDescription = request.getDescription();
        if (logDescription == null || logDescription.isEmpty()) {
            switch (newStatus) {
                case ACCEPTED: logDescription = "Le colis a été attribué au livreur."; break;
                case PICKED_UP: logDescription = "Le livreur a récupéré le colis au point de collecte."; break;
                case IN_TRANSIT: logDescription = "Le colis est en cours d'acheminement."; break;
                case ARRIVED_AT_HUB: logDescription = "Le colis est arrivé au centre de tri."; break;
                case OUT_FOR_DELIVERY: logDescription = "Le colis est en cours de livraison à domicile."; break;
                case DELIVERED: logDescription = "Le colis a été livré avec succès."; break;
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
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " a été récupéré par le livreur.");
        } else if (newStatus == ParcelStatus.IN_TRANSIT) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " est en transit.");
        } else if (newStatus == ParcelStatus.ARRIVED_AT_HUB) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " est arrivé au centre de tri.");
        } else if (newStatus == ParcelStatus.OUT_FOR_DELIVERY) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " est en cours de livraison.");
        } else if (newStatus == ParcelStatus.DELIVERED) {
            notificationService.createNotification(parcel.getClient(), savedParcel, "Votre colis " + savedParcel.getTrackingId() + " a été livré avec succès !");
        }

        return parcelMapper.toResponse(savedParcel);
    }
}
