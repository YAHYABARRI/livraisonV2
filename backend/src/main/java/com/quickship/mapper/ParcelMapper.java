package com.quickship.mapper;

import com.quickship.dto.DeliveryLogResponse;
import com.quickship.dto.ParcelResponse;
import com.quickship.entity.DeliveryLog;
import com.quickship.entity.Parcel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class ParcelMapper {

    @Autowired
    private UserMapper userMapper;

    public ParcelResponse toResponse(Parcel parcel) {
        if (parcel == null) {
            return null;
        }
        
        return ParcelResponse.builder()
                .id(parcel.getId())
                .trackingNumber(parcel.getTrackingNumber())
                .trackingId(parcel.getTrackingId())
                .shippingPrice(parcel.getShippingPrice())
                .parcelType(parcel.getParcelType())
                .recipientName(parcel.getRecipientName())
                .recipientPhone(parcel.getRecipientPhone())
                .pickupAddress(parcel.getPickupAddress())
                .deliveryAddress(parcel.getDeliveryAddress())
                .description(parcel.getDescription())
                .weight(parcel.getWeight())
                .status(parcel.getStatus().name())
                .estimatedDelivery(parcel.getEstimatedDelivery())
                .client(userMapper.toResponse(parcel.getClient()))
                .driver(userMapper.toResponse(parcel.getDriver()))
                .logs(parcel.getLogs() == null ? Collections.emptyList() :
                        parcel.getLogs().stream()
                                .map(this::toLogResponse)
                                .collect(Collectors.toList()))
                .createdAt(parcel.getCreatedAt())
                .build();
    }

    public DeliveryLogResponse toLogResponse(DeliveryLog log) {
        if (log == null) {
            return null;
        }
        
        return DeliveryLogResponse.builder()
                .id(log.getId())
                .status(log.getStatus().name())
                .description(log.getDescription())
                .timestamp(log.getTimestamp())
                .build();
    }
}
