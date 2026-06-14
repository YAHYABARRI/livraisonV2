# QuickShip Design System

Source of truth for the redesigned logistics UI. See `REDESIGN.md` for wireframes, page structure, UX rationale and Higgsfield prompts.

## Brand Positioning

QuickShip is a premium logistics control platform: fast, trustworthy, operational and clear. The UI should feel closer to a FedEx/Uber/Stripe-grade product than a generic admin template.

## Tokens

| Role | Hex |
| --- | --- |
| Primary | `#0B5FFF` |
| Success | `#00A676` |
| Accent | `#F97316` |
| Background | `#F5F8FC` |
| Surface | `#FFFFFF` |
| Ink | `#132033` |
| Muted text | `#637083` |
| Border | `#DFE7F0` |
| Dark background | `#07111F` |

## Typography

- Display: `Manrope`.
- UI/body: `Inter`.
- No negative letter spacing.
- Dense panels use compact type: 12-14 px labels, 16-18 px section titles.

## Components

- `PageHeader`
- `StatCard`
- `StatusBadge`
- `ProgressRoute`
- `TrackingTimeline`
- `EmptyPanel`
- `.data-table`
- `.input-premium`
- `.btn-premium-primary`
- `.btn-premium-secondary`
- `.icon-button`

## Status System

| Status | Label | Tone |
| --- | --- | --- |
| `CREATED` | Créé | Amber |
| `ACCEPTED` | Accepté | Blue |
| `PICKED_UP` | Collecté | Teal |
| `IN_TRANSIT` | En transit | Blue |
| `ARRIVED_AT_HUB` | Centre de tri | Sky |
| `OUT_FOR_DELIVERY` | En livraison | Green |
| `DELIVERED` | Livré | Success green |
| `RETURNED` | Retourné | Rose |

## Rules

- Tracking is the primary product feature and must remain highly visible.
- Cards use 8 px radius.
- Tables are dense, scannable and action-oriented.
- Use lucide icons only.
- Keep hover/focus states visible and smooth.
- Preserve backend logic and API contracts.
- Avoid decorative orb/blob backgrounds and one-note color palettes.
