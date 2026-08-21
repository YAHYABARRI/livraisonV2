package com.quickship.service;

import com.quickship.dto.DeliveryRateRequest;
import com.quickship.dto.DeliveryRateOrderRequest;
import com.quickship.dto.DeliveryRateResponse;
import com.quickship.entity.DeliveryRate;
import com.quickship.exception.BadRequestException;
import com.quickship.exception.ResourceNotFoundException;
import com.quickship.repository.DeliveryRateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DeliveryRateService {

    @Autowired
    private DeliveryRateRepository deliveryRateRepository;

    public List<DeliveryRateResponse> getAllRates() {
        return deliveryRateRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public DeliveryRateResponse createRate(DeliveryRateRequest request) {
        String city = request.getCity().trim();
        if (deliveryRateRepository.existsByCityIgnoreCase(city)) {
            throw new BadRequestException("Cette ville existe deja dans le tableau des tarifs.");
        }

        DeliveryRate rate = DeliveryRate.builder()
                .city(city)
                .deliveryFee(request.getDeliveryFee())
                .returnFee(request.getReturnFee() != null ? request.getReturnFee() : 0.0)
                .displayOrder(deliveryRateRepository.findMaxDisplayOrder() + 1)
                .build();

        return toResponse(deliveryRateRepository.save(rate));
    }

    public DeliveryRateResponse updateRate(Long id, DeliveryRateRequest request) {
        DeliveryRate rate = deliveryRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarif introuvable avec l'ID : " + id));

        String city = request.getCity().trim();
        deliveryRateRepository.findByCityIgnoreCase(city)
                .filter(existingRate -> !existingRate.getId().equals(id))
                .ifPresent(existingRate -> {
                    throw new BadRequestException("Cette ville existe deja dans le tableau des tarifs.");
                });

        rate.setCity(city);
        rate.setDeliveryFee(request.getDeliveryFee());
        rate.setReturnFee(request.getReturnFee() != null ? request.getReturnFee() : 0.0);

        return toResponse(deliveryRateRepository.save(rate));
    }

    public void deleteRate(Long id) {
        DeliveryRate rate = deliveryRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarif introuvable avec l'ID : " + id));
        deliveryRateRepository.delete(rate);
    }

    @Transactional
    public List<DeliveryRateResponse> reorderRates(DeliveryRateOrderRequest request) {
        List<DeliveryRate> rates = deliveryRateRepository.findAll();
        List<Long> requestedIds = request.getRateIds();
        Set<Long> uniqueIds = Set.copyOf(requestedIds);

        if (requestedIds.size() != rates.size() || uniqueIds.size() != requestedIds.size()) {
            throw new BadRequestException("La liste des villes est incomplete ou contient des doublons.");
        }

        Map<Long, DeliveryRate> ratesById = new HashMap<>();
        for (DeliveryRate rate : rates) {
            ratesById.put(rate.getId(), rate);
        }

        if (!ratesById.keySet().equals(uniqueIds)) {
            throw new BadRequestException("La liste des villes contient un tarif inconnu.");
        }

        for (int index = 0; index < requestedIds.size(); index++) {
            ratesById.get(requestedIds.get(index)).setDisplayOrder(index + 1);
        }

        deliveryRateRepository.saveAll(ratesById.values());
        return getAllRates();
    }

    private DeliveryRateResponse toResponse(DeliveryRate rate) {
        return DeliveryRateResponse.builder()
                .id(rate.getId())
                .city(rate.getCity())
                .deliveryFee(rate.getDeliveryFee())
                .returnFee(rate.getReturnFee())
                .displayOrder(rate.getDisplayOrder())
                .build();
    }
}
