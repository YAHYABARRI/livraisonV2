// TypeScript Reference Types for GLADEX DELIVERY Reports Module

export enum ParcelStatus {
  DELIVERED = 'DELIVERED',
  IN_EXPEDITION = 'IN_EXPEDITION',
  SECOND_CALL = 'SECOND_CALL',
  UNREACHABLE = 'UNREACHABLE',
  REFUSED = 'REFUSED',
  RETURN_TO_CLIENT = 'RETURN_TO_CLIENT',
  RETURN_TO_STOCK = 'RETURN_TO_STOCK',
  PICKED_UP = 'PICKED_UP',
  WAITING_PICKUP = 'WAITING_PICKUP'
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
  deliveryCity?: string;
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
