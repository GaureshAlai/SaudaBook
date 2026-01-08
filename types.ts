
export type Language = 'en' | 'hi' | 'mr';

export interface User {
  id: string;
  email: string;
  businessName: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
}

export interface ContractItem {
  id: string;
  productName: string;
  rate: number;
  totalQuantity: number;
  receivedQuantity: number;
}

export interface Delivery {
  id: string;
  date: string;
  quantity: number;
  itemId: string;
  remarks?: string;
}

export enum ContractStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface Contract {
  id: string;
  date: string;
  time: string;
  brokerName: string;
  vendorName: string;
  status: ContractStatus;
  items: ContractItem[];
  deliveries: Delivery[];
  updatedAt?: number;
}

export interface AppTranslations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  enabled: boolean;
  lastSync?: number;
}
