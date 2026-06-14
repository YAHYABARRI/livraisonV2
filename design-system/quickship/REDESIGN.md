# QuickShip Redesign - UX/UI Production Brief

## Vision

QuickShip doit se lire comme une console logistique internationale: fiable, rapide, dense sans être froide, avec le tracking comme fonction centrale. La refonte conserve la logique métier existante et standardise uniquement l'interface, les composants et les parcours visibles.

## Design System

### Couleurs

| Token | Usage | Hex |
| --- | --- | --- |
| Primary blue | Actions, tracking, liens, focus | `#0B5FFF` |
| Success green | Livré, validation, KPI positif | `#00A676` |
| Accent orange | Points d'attention, CTA secondaires | `#F97316` |
| Neutral background | Fond application | `#F5F8FC` |
| Ink | Texte principal | `#132033` |
| Border | Tables, cards, inputs | `#DFE7F0` |
| Dark background | Mode sombre | `#07111F` |

### Typographie

- Titres: `Manrope`, poids 700-900.
- Interface: `Inter`, poids 400-800.
- H1 dashboard: 24-30 px.
- Titres de panneaux: 18 px.
- Tables et labels: 12-14 px, graisse forte pour la lecture rapide.

### Grille et spacing

- Shell desktop: sidebar fixe `256px`, contenu max `1280px`.
- Mobile: tiroir navigation, contenu plein écran avec padding 16 px.
- Spacing standard: 8 / 12 / 16 / 20 / 24 / 32.
- Cards: rayon 8 px, bordure fine, ombre légère.

### Composants réutilisables

- `PageHeader`: eyebrow, titre, description, actions.
- `StatCard`: KPI avec icône, valeur et détail.
- `StatusBadge`: statut colis avec dot et couleur métier.
- `ProgressRoute`: route visuelle collecte -> livraison.
- `TrackingTimeline`: étapes normalisées du statut colis.
- `EmptyPanel`: état vide actionnable.
- `.data-table`: table admin dense et scannable.
- `.input-premium`, `.btn-premium-primary`, `.btn-premium-secondary`, `.icon-button`.

## Wireframes Détaillés

### Dashboard client

1. Header: contexte "Espace client", titre, bouton "Nouveau colis".
2. Row KPI: total colis, livrés, en cours, dépenses mensuelles.
3. Bloc central tracking express: champ suivi + dernier colis actif + route de progression.
4. Actions rapides: expédier, historique, tracking public.
5. Volume mensuel: bar chart compact.
6. Dernières expéditions: table de 5 lignes, badges et action détail.

### Suivi de colis

1. Navbar publique.
2. Header tracking.
3. Recherche numéro de suivi.
4. Résultat: statut, tracking ID, route dynamique.
5. Split desktop: fiche logistique à gauche, timeline d'acheminement à droite.
6. Mobile: sections empilées, route pleine largeur.

### Création colis

1. Header "Nouvelle commande".
2. Formulaire en 3 blocs: destinataire, colis, itinéraire.
3. Rail latéral desktop: étapes créer -> attribuer -> acheminer -> livrer.
4. Actions fixes en bas du formulaire: annuler, confirmer.

### Liste colis client

1. Header + actions exporter/nouveau colis.
2. Barre recherche + filtre statut exact.
3. Table dense: suivi, destinataire, destination, poids, statut, création, actions.
4. Modal détail: statut, route, informations, timeline, facture.

### Dashboard admin

1. Header "Control tower".
2. KPI: clients, livreurs, colis total, chiffre d'affaires.
3. Table flux récents: suivi, client, destinataire, livraison, livreur, statut.
4. Modal attribution livreur.

### Pages admin

- Utilisateurs: annuaire scannable avec rôle, email, téléphone.
- Colis: filtres, table globale, attribution, modal inspection.
- Rapports: KPI financiers, filtres PDF, multi-sélection clients, aperçu PDF.

### Livreur

1. Dashboard avec course prioritaire.
2. Liste des courses filtrable.
3. Modal de mise à jour statut avec note d'étape.

### Profil et paramètres

- Profil: infos générales + panneau rôle/identité.
- Paramètres: langue, notifications, sécurité, audit.

## Suggestions UX

- Mettre le tracking dans le header connecté pour réduire le temps d'accès.
- Remplacer les filtres approximatifs par les statuts backend réels.
- Afficher les colis non attribués avec une couleur d'attention côté admin.
- Garder les actions dangereuses ou externes sous forme de boutons icônes avec tooltip/title.
- Prévoir à terme un endpoint de recherche global pour éviter le filtrage client-side sur gros volumes.
- Code-splitter les pages admin et rapports pour réduire le chunk Vite principal.

## Prompts Higgsfield CLI

### Dashboard client

```text
Design a premium logistics SaaS client dashboard for "QuickShip". Corporate blue, trust green, neutral background, compact sidebar, top navigation, KPI cards, central parcel tracking search, dynamic route progress, recent shipments table. Style inspired by FedEx, Uber, Stripe, Notion, without copying. Mobile-first and production-ready React UI, 8px radius cards, dense enterprise layout, clean typography Inter/Manrope.
```

### Tracking temps réel

```text
Create a high-fidelity parcel tracking screen for an international delivery platform. Feature a large tracking search, parcel ID, current status badge, animated route from pickup to delivery, logistics details, and vertical event timeline. Use blue/green/neutral palette, minimal enterprise design, no decorative gradients, responsive desktop and mobile.
```

### Admin control tower

```text
Generate an admin logistics control tower dashboard. Include KPI cards for clients, drivers, parcels, revenue, a dense operations table, unassigned driver alert states, assign-driver modal, and PDF reporting entry points. Premium SaaS style, strong hierarchy, compact tables, polished hover/focus states, professional logistics tone.
```

### Create parcel form

```text
Design a parcel creation workflow form with three sections: recipient, package specs, pickup/delivery route. Include validation states, sidebar process checklist, primary submit action, secondary cancel action, mobile stacking. Enterprise logistics SaaS, blue/green/neutral palette, 8px radius, clear labels, optimized for fast repeated data entry.
```
