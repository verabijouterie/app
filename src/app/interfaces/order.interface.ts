import { User } from './user.interface';
import { Transaction } from './transaction.interface';

export interface Order {
  id?: number;
  user_id: number;
  description: string;
  client_name: string;
  client_phone: string;
  total_order_amount: number;
  remaining_amount: number;
  date_planned: Date;
  date_fulfilled?: Date | null;
  transactions: Transaction[];
  total24kProductOut: number;
  total24kOut: number;	
  totalCashIn: number;
  totalBankIn: number;
  totalPaymentIn: number;
  status?: 'ToBeOrdered' | 'AwaitingWholesaler' | 'AwaitingCustomer' | 'HandedOut' | 'Completed' | null;

} 