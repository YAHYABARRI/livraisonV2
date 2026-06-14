package com.quickship.config;

import com.quickship.entity.*;
import com.quickship.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private DeliveryLogRepository deliveryLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Migrate legacy SQL values before JPA entities fetch them
        try {
            jdbcTemplate.execute("ALTER TABLE parcels MODIFY COLUMN status VARCHAR(50) NOT NULL");
        } catch (Exception e) {
            System.err.println("Note: Could not alter parcels status column (may already be VARCHAR): " + e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE delivery_logs MODIFY COLUMN status VARCHAR(50) NOT NULL");
        } catch (Exception e) {
            System.err.println("Note: Could not alter delivery_logs status column (may already be VARCHAR): " + e.getMessage());
        }
        try {
            jdbcTemplate.execute("UPDATE parcels SET status = 'CREATED' WHERE status = 'PENDING'");
            jdbcTemplate.execute("UPDATE parcels SET status = 'ACCEPTED' WHERE status = 'ASSIGNED'");
            jdbcTemplate.execute("UPDATE delivery_logs SET status = 'CREATED' WHERE status = 'PENDING'");
            jdbcTemplate.execute("UPDATE delivery_logs SET status = 'ACCEPTED' WHERE status = 'ASSIGNED'");
        } catch (Exception e) {
            System.err.println("Legacy status update failed: " + e.getMessage());
        }

        if (roleRepository.count() == 0) {
            seedRoles();
        }

        if (userRepository.count() == 0) {
            seedUsersAndParcels();
        }

        // Backfill legacy parcels on startup
        backfillLegacyParcels();
    }

    private void seedRoles() {
        roleRepository.save(new Role(null, RoleType.CLIENT));
        roleRepository.save(new Role(null, RoleType.DRIVER));
        roleRepository.save(new Role(null, RoleType.ADMIN));
    }

    private void seedUsersAndParcels() {
        Role clientRole = roleRepository.findByName(RoleType.CLIENT).orElse(null);
        Role driverRole = roleRepository.findByName(RoleType.DRIVER).orElse(null);
        Role adminRole = roleRepository.findByName(RoleType.ADMIN).orElse(null);

        // 1. Seed Users
        User admin = User.builder()
                .email("admin@quickship.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Sarah")
                .lastName("Martin")
                .phone("0601020304")
                .roles(new HashSet<>(Collections.singletonList(adminRole)))
                .build();
        userRepository.save(admin);

        User driver = User.builder()
                .email("livreur@quickship.com")
                .password(passwordEncoder.encode("driver123"))
                .firstName("Jean")
                .lastName("Dupont")
                .phone("0611223344")
                .roles(new HashSet<>(Collections.singletonList(driverRole)))
                .build();
        userRepository.save(driver);

        User client = User.builder()
                .email("client@quickship.com")
                .password(passwordEncoder.encode("client123"))
                .firstName("Alice")
                .lastName("Dubois")
                .phone("0655667788")
                .roles(new HashSet<>(Collections.singletonList(clientRole)))
                .build();
        userRepository.save(client);

        // 2. Seed Parcels for Alice Dubois
        
        // Parcel 1: CREATED
        Parcel parcel1 = Parcel.builder()
                .trackingNumber("QS-2026-MARKLAUR4982")
                .recipientName("Marc Laurent")
                .recipientPhone("0712345678")
                .pickupAddress("12 Rue de la Paix, 75002 Paris")
                .deliveryAddress("45 Avenue des Champs-Élysées, 75008 Paris")
                .description("Documents professionnels importants")
                .weight(1.2)
                .status(ParcelStatus.CREATED)
                .estimatedDelivery(LocalDateTime.now().plusDays(2))
                .client(client)
                .build();
        parcelRepository.save(parcel1);

        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.CREATED)
                .description("Colis enregistré. En attente de traitement.")
                .parcel(parcel1)
                .build());

        // Parcel 2: ACCEPTED / IN TRANSIT
        Parcel parcel2 = Parcel.builder()
                .trackingNumber("QS-2026-THOMBERN7549")
                .recipientName("Thomas Bernard")
                .recipientPhone("0698765432")
                .pickupAddress("8 Boulevard Haussmann, 75009 Paris")
                .deliveryAddress("18 Rue Royale, 69001 Lyon")
                .description("Ordinateur portable de remplacement")
                .weight(3.5)
                .status(ParcelStatus.IN_TRANSIT)
                .estimatedDelivery(LocalDateTime.now().plusDays(1))
                .client(client)
                .driver(driver)
                .build();
        parcelRepository.save(parcel2);

        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.CREATED)
                .description("Colis enregistré.")
                .parcel(parcel2)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.ACCEPTED)
                .description("Colis attribué à Jean Dupont.")
                .parcel(parcel2)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.PICKED_UP)
                .description("Colis collecté chez l'expéditeur.")
                .parcel(parcel2)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.IN_TRANSIT)
                .description("Colis en cours d'acheminement vers Lyon.")
                .parcel(parcel2)
                .build());

        // Parcel 3: DELIVERED
        Parcel parcel3 = Parcel.builder()
                .trackingNumber("QS-2026-EMMAPETI2108")
                .recipientName("Emma Petit")
                .recipientPhone("0633445566")
                .pickupAddress("5 Rue de Rivoli, 75004 Paris")
                .deliveryAddress("30 Place Bellecour, 69002 Lyon")
                .description("Cadeau d'anniversaire")
                .weight(2.0)
                .status(ParcelStatus.DELIVERED)
                .estimatedDelivery(LocalDateTime.now().minusDays(1))
                .client(client)
                .driver(driver)
                .build();
        parcelRepository.save(parcel3);

        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.CREATED)
                .description("Colis enregistré.")
                .parcel(parcel3)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.ACCEPTED)
                .description("Colis attribué à Jean Dupont.")
                .parcel(parcel3)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.PICKED_UP)
                .description("Colis collecté.")
                .parcel(parcel3)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.IN_TRANSIT)
                .description("Colis en transit.")
                .parcel(parcel3)
                .build());
        deliveryLogRepository.save(DeliveryLog.builder()
                .status(ParcelStatus.DELIVERED)
                .description("Colis livré en main propre à Emma Petit.")
                .parcel(parcel3)
                .build());
    }

    private void backfillLegacyParcels() {
        java.util.List<Parcel> parcels = parcelRepository.findAll();
        for (Parcel p : parcels) {
            boolean updated = false;
            if (p.getTrackingId() == null || p.getTrackingId().isEmpty()) {
                p.setTrackingId(p.getTrackingNumber() != null ? p.getTrackingNumber() : generateLegacyTrackingId());
                updated = true;
            }
            if (p.getShippingPrice() == null) {
                p.setShippingPrice(15.0 + (p.getWeight() != null ? p.getWeight() * 2.5 : 0.0));
                updated = true;
            }
            if (p.getParcelType() == null) {
                p.setParcelType(determineLegacyParcelType(p.getWeight()));
                updated = true;
            }
            if (updated) {
                parcelRepository.save(p);
            }
        }
    }

    private String generateLegacyTrackingId() {
        int year = LocalDateTime.now().getYear();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(15);
        java.security.SecureRandom random = new java.security.SecureRandom();
        for (int i = 0; i < 15; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return "QS-" + year + "-" + sb.toString();
    }

    private String determineLegacyParcelType(Double w) {
        if (w == null) return "Colis Standard";
        if (w <= 1.0) return "Enveloppe";
        if (w <= 5.0) return "Petit Colis";
        if (w <= 10.0) return "Colis Moyen";
        return "Grand Colis";
    }
}
