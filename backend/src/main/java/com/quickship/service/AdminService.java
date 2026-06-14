package com.quickship.service;

import com.quickship.dto.DashboardStatsResponse;
import com.quickship.dto.ParcelResponse;
import com.quickship.dto.UserResponse;
import com.quickship.entity.*;
import com.quickship.exception.BadRequestException;
import com.quickship.exception.ResourceNotFoundException;
import com.quickship.mapper.ParcelMapper;
import com.quickship.mapper.UserMapper;
import com.quickship.repository.DeliveryLogRepository;
import com.quickship.repository.ParcelRepository;
import com.quickship.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private DeliveryLogRepository deliveryLogRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ParcelMapper parcelMapper;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getAllDrivers() {
        return userRepository.findByRoleType(RoleType.DRIVER).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ParcelResponse> getAllParcels() {
        return parcelRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(parcelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ParcelResponse assignDriver(Long parcelId, Long driverId) {
        Parcel parcel = parcelRepository.findById(parcelId)
                .orElseThrow(() -> new ResourceNotFoundException("Colis non trouvé avec l'id : " + parcelId));

        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Livreur non trouvé avec l'id : " + driverId));

        boolean isDriver = driver.getRoles().stream()
                .anyMatch(role -> role.getName() == RoleType.DRIVER);

        if (!isDriver) {
            throw new BadRequestException("L'utilisateur spécifié n'est pas un livreur");
        }

        parcel.setDriver(driver);
        parcel.setStatus(ParcelStatus.ACCEPTED);
        Parcel savedParcel = parcelRepository.save(parcel);

        DeliveryLog log = DeliveryLog.builder()
                .status(ParcelStatus.ACCEPTED)
                .description("Le colis a été attribué au livreur : " + driver.getFirstName() + " " + driver.getLastName())
                .parcel(savedParcel)
                .build();
        deliveryLogRepository.save(log);

        return parcelMapper.toResponse(savedParcel);
    }

    public DashboardStatsResponse getDashboardStats() {
        long totalClients = userRepository.findByRoleType(RoleType.CLIENT).size();
        long totalDrivers = userRepository.findByRoleType(RoleType.DRIVER).size();
        
        List<Parcel> parcels = parcelRepository.findAll();
        long totalParcels = parcels.size();
        
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        long parcelsToday = parcels.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfDay))
                .count();

        long pendingParcels = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.CREATED)
                .count();

        long activeParcels = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.ACCEPTED 
                        || p.getStatus() == ParcelStatus.PICKED_UP 
                        || p.getStatus() == ParcelStatus.IN_TRANSIT
                        || p.getStatus() == ParcelStatus.ARRIVED_AT_HUB
                        || p.getStatus() == ParcelStatus.OUT_FOR_DELIVERY)
                .count();

        long deliveredParcels = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.DELIVERED)
                .count();

        double simulatedRevenue = parcels.stream()
                .mapToDouble(p -> p.getShippingPrice() != null ? p.getShippingPrice() : (15.0 + (p.getWeight() * 2.5)))
                .sum();

        return DashboardStatsResponse.builder()
                .totalClients(totalClients)
                .totalDrivers(totalDrivers)
                .totalParcels(totalParcels)
                .parcelsToday(parcelsToday)
                .pendingParcels(pendingParcels)
                .activeParcels(activeParcels)
                .deliveredParcels(deliveredParcels)
                .simulatedRevenue(simulatedRevenue)
                .build();
    }

    public Page<UserResponse> getAllUsersPaginated(String search, Pageable pageable) {
        return userRepository.searchUsers(search, pageable)
                .map(userMapper::toResponse);
    }

    public Page<ParcelResponse> getAllParcelsPaginated(String search, Pageable pageable) {
        return parcelRepository.searchAllParcels(search, pageable)
                .map(parcelMapper::toResponse);
    }
}
