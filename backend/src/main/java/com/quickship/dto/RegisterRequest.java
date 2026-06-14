package com.quickship.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "L'adresse email est requise")
    @Email(message = "L'adresse email doit être valide")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 6, message = "Le mot de passe doit faire au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le prénom est requis")
    @Size(max = 50)
    private String firstName;

    @NotBlank(message = "Le nom est requis")
    @Size(max = 50)
    private String lastName;

    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Le rôle est requis")
    private String role; // CLIENT, DRIVER, ADMIN
}
