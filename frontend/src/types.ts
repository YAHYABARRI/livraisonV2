// TypeScript Reference Types for QuickShip Reports & Invoices Module

export enum ParcelStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_HUB = 'ARRIVED_AT_HUB',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED'
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
}

export interface Parcel {
  id: number;
  trackingId: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  status: ParcelStatus;
  shippingPrice: number;
  parcelType: string;
  createdAt: string;
  client: User;
  driver?: User;
}

export interface ReportStats {
  revenueToday: number;
  revenueMonth: number;
  deliveredCount: number;
  pendingCount: number;
  returnedCount: number;
}

export interface ReportRequest {
  startDate?: string;
  endDate?: string;
  driverId?: number;
  clientId?: number;
  statuses?: ParcelStatus[];
}

export interface MultiClientReportRequest {
  startDate?: string;
  endDate?: string;
  driverId?: number;
  clientIds?: number[];
  statuses?: ParcelStatus[];
}
