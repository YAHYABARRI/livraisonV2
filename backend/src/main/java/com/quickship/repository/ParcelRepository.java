package com.quickship.repository;

import com.quickship.entity.Parcel;
import com.quickship.entity.ParcelStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long>, JpaSpecificationExecutor<Parcel> {
    
    List<Parcel> findByClientIdOrderByCreatedAtDesc(Long clientId);
    
    List<Parcel> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    
    Optional<Parcel> findByTrackingId(String trackingId);
    
    Optional<Parcel> findByTrackingNumber(String trackingNumber);
    
    List<Parcel> findAllByOrderByCreatedAtDesc();

    List<Parcel> findByIdInOrderByCreatedAtDesc(Collection<Long> ids);

    List<Parcel> findByClientIdAndIdInOrderByCreatedAtDesc(Long clientId, Collection<Long> ids);

    List<Parcel> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    List<Parcel> findByClientIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long clientId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT DISTINCT p FROM Parcel p LEFT JOIN p.logs l WHERE " +
           "(p.createdAt BETWEEN :start AND :end) OR " +
           "(l.status = :status AND l.timestamp BETWEEN :start AND :end) " +
           "ORDER BY p.createdAt DESC")
    List<Parcel> findCreatedOrStatusLoggedBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") ParcelStatus status);

    @Query("SELECT DISTINCT p FROM Parcel p LEFT JOIN p.logs l WHERE p.client.id = :clientId AND (" +
           "(p.createdAt BETWEEN :start AND :end) OR " +
           "(l.status = :status AND l.timestamp BETWEEN :start AND :end)) " +
           "ORDER BY p.createdAt DESC")
    List<Parcel> findClientCreatedOrStatusLoggedBetween(
            @Param("clientId") Long clientId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") ParcelStatus status);

    @Query("SELECT p FROM Parcel p WHERE p.client.id = :clientId AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(p.trackingId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.recipientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.deliveryAddress) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Parcel> searchClientParcels(@Param("clientId") Long clientId, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Parcel p WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(p.trackingId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.recipientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.client.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.client.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.deliveryAddress) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Parcel> searchAllParcels(@Param("search") String search, Pageable pageable);
}
