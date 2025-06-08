export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  createdAt: string;
}

export interface ServiceTicket {
  id: string;
  customerId: string;
  deviceType: string;
  problem: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  notes: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost: number;
  technicianId?: string;
  completionTime?: string;
  partsUsed?: InventoryItem[];
}

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  status: 'available' | 'busy'; // Tipe status harus 'available' atau 'busy'
  completedTickets: number;
  averageCompletionTime: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number;
  category: string;
}

export interface ServiceHistory {
  ticketId: string;
  customerId: string;
  date: string;
  service: string;
  cost: number;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'cso' | 'technician';
  createdAt: string;
  updatedAt: string;
}

export type AIProvider = 'qwen' | 'deepseak' | 'chatgpt' | 'claude';

export interface AIConfig {
  name: string;
  id: AIProvider;
  available: boolean;
  apiKey?: string;
  endpoint?: string;
}
