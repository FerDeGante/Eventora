// src/types/index.ts
export interface Reservation {
  id: string;
  date: string;
  userName: string;
  serviceName: string;
  packageId?: string;
  branchId?: string;
  sessionNumber: number;
  totalSessions: number;
  therapistName?: string;
  paymentMethod?: string;
}