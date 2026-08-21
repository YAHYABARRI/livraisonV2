package com.quickship.repository;

import com.quickship.entity.DeliveryRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRateRepository extends JpaRepository<DeliveryRate, Long> {
    boolean existsByCityIgnoreCase(String city);

    Optional<DeliveryRate> findByCityIgnoreCase(String city);

    List<DeliveryRate> findAllByOrderByDisplayOrderAscIdAsc();

    List<DeliveryRate> findAllByOrderByIdDesc();

    @Query("SELECT COALESCE(MAX(r.displayOrder), 0) FROM DeliveryRate r")
    Integer findMaxDisplayOrder();
}
