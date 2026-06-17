package com.quickship.repository;

import com.quickship.entity.DeliveryRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRateRepository extends JpaRepository<DeliveryRate, Long> {
    boolean existsByCityIgnoreCase(String city);

    Optional<DeliveryRate> findByCityIgnoreCase(String city);

    List<DeliveryRate> findAllByOrderByCityAsc();
}
