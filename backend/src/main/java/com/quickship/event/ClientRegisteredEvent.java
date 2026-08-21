package com.quickship.event;

import com.quickship.entity.User;

import java.time.LocalDateTime;

public record ClientRegisteredEvent(
        Long userId,
        String firstName,
        String lastName,
        String email,
        String phone,
        LocalDateTime registeredAt
) {
    public static ClientRegisteredEvent from(User user) {
        return new ClientRegisteredEvent(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getCreatedAt()
        );
    }
}
