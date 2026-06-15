import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "L'adresse email est requise")
    .email("Format d'adresse email invalide"),
  password: z.string()
    .min(1, 'Le mot de passe est requis'),
});

export const registerSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "L'adresse email est requise")
    .email("Format d'adresse email invalide")
    .max(100, "L'email ne doit pas dépasser 100 caractères"),
  password: z.string()
    .min(6, 'Le mot de passe doit faire au moins 6 caractères'),
  firstName: z.string()
    .trim()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
  lastName: z.string()
    .trim()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  phone: z.string()
    .trim()
    .min(10, 'Le numéro de téléphone doit faire au moins 10 chiffres')
    .max(20, 'Le numéro est trop long'),
  role: z.enum(['CLIENT', 'DRIVER', 'ADMIN'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un rôle valide' }),
  }),
});

export const parcelSchema = z.object({
  recipientName: z.string()
    .trim()
    .min(1, 'Le nom du destinataire est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  recipientPhone: z.string()
    .trim()
    .min(10, 'Le téléphone du destinataire est requis (10 chiffres min)')
    .max(20, 'Le numéro est trop long'),
  pickupAddress: z.string()
    .trim()
    .min(10, "L'adresse de collecte doit faire au moins 10 caractères"),
  deliveryAddress: z.string()
    .trim()
    .min(10, "L'adresse de livraison doit faire au moins 10 caractères"),
  deliveryCity: z.string()
    .trim()
    .min(2, 'La ville de livraison est requise')
    .max(100, 'La ville de livraison est trop longue'),
  description: z.string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .optional(),
  weight: z.preprocess(
    (val) => parseFloat(val),
    z.number({ invalid_type_error: 'Le poids doit être un nombre' })
      .positive('Le poids doit être supérieur à 0')
      .max(5, 'Le poids du colis ne doit pas dépasser 5 kg')
  ),
});
