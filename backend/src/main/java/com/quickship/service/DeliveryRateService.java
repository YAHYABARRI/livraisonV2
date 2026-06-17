package com.quickship.service;

import com.quickship.dto.DeliveryRateRequest;
import com.quickship.dto.DeliveryRateResponse;
import com.quickship.entity.DeliveryRate;
import com.quickship.exception.BadRequestException;
import com.quickship.exception.ResourceNotFoundException;
import com.quickship.repository.DeliveryRateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryRateService {

    @Autowired
    private DeliveryRateRepository deliveryRateRepository;

    public List<DeliveryRateResponse> getAllRates() {
        return deliveryRateRepository.findAllByOrderByCityAsc().stream()
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

    private DeliveryRateResponse toResponse(DeliveryRate rate) {
        return DeliveryRateResponse.builder()
                .id(rate.getId())
                .city(rate.getCity())
                .deliveryFee(rate.getDeliveryFee())
                .returnFee(rate.getReturnFee())
                .build();
    }
}
