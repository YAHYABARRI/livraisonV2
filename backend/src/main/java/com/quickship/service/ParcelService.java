package com.quickship.service;

import com.quickship.dto.ParcelRequest;
import com.quickship.dto.ParcelResponse;
import com.quickship.entity.*;
import com.quickship.exception.ResourceNotFoundException;
import com.quickship.exception.UnauthorizedException;
import com.quickship.mapper.ParcelMapper;
import com.quickship.repository.DeliveryLogRepository;
import com.quickship.repository.ParcelRepository;
import com.quickship.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParcelService {

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

    @Transactional
    public ParcelResponse createParcel(ParcelRequest request, String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));

        Parcel parcel = Parcel.builder()
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .description(request.getDescription())
                .weight(request.getWeight())
                .status(ParcelStatus.CREATED)
                .estimatedDelivery(request.getEstimatedDelivery() != null ? request.getEstimatedDelivery() : LocalDateTime.now().plusDays(2))
                .client(client)
                .build();

        Parcel savedParcel = parcelRepository.save(parcel);

        DeliveryLog initialLog = DeliveryLog.builder()
                .status(ParcelStatus.CREATED)
                .description("Colis enregistré avec succès. En attente de traitement.")
                .parcel(savedParcel)
                .build();
        deliveryLogRepository.save(initialLog);

        // Send Notification
        notificationService.createNotification(client, savedParcel, "Votre colis " + savedParcel.getTrackingId() + " a été enregistré avec succès.");

        return parcelMapper.toResponse(savedParcel);
    }

    public List<ParcelResponse> getClientParcels(String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
        return parcelRepository.findByClientIdOrderByCreatedAtDesc(client.getId()).stream()
                .map(parcelMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ParcelResponse getParcelById(Long id, String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
        Parcel parcel = parcelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Colis non trouvé avec l'id : " + id));

        if (!parcel.getClient().getId().equals(client.getId())) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à accéder à ce colis");
        }

        return parcelMapper.toResponse(parcel);
    }

    public ParcelResponse getParcelByTrackingId(String trackingId, String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
        Parcel parcel = parcelRepository.findByTrackingId(trackingId)
                .or(() -> parcelRepository.findByTrackingNumber(trackingId))
                .orElseThrow(() -> new ResourceNotFoundException("Colis non trouvé avec le numéro de suivi : " + trackingId));

        if (!parcel.getClient().getId().equals(client.getId())) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à accéder à ce colis");
        }

        return parcelMapper.toResponse(parcel);
    }

    public ParcelResponse getParcelByTrackingIdPublic(String trackingId) {
        Parcel parcel = parcelRepository.findByTrackingId(trackingId)
                .or(() -> parcelRepository.findByTrackingNumber(trackingId))
                .orElseThrow(() -> new ResourceNotFoundException("Colis non trouvé avec le numéro de suivi : " + trackingId));
        return parcelMapper.toResponse(parcel);
    }

    public Page<ParcelResponse> getClientParcelsPaginated(String clientEmail, String search, Pageable pageable) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
        return parcelRepository.searchClientParcels(client.getId(), search, pageable)
                .map(parcelMapper::toResponse);
    }

    public Parcel getParcelEntityByTrackingId(String trackingId, String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));
        Parcel parcel = parcelRepository.findByTrackingId(trackingId)
                .or(() -> parcelRepository.findByTrackingNumber(trackingId))
                .orElseThrow(() -> new ResourceNotFoundException("Colis non trouvé avec le numéro de suivi : " + trackingId));

        if (!parcel.getClient().getId().equals(client.getId())) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à accéder à ce colis");
        }
        return parcel;
    }
}
