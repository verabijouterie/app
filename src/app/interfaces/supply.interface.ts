import { Transaction } from './transaction.interface';
import { Wholesaler } from './wholesaler.interface';

export interface Supply {
  id: number | null;
  date: string;
  user_id: number;
  description: string;
  transactions: Transaction[];
  addedTransactions: Transaction[];
  removedTransactions: Transaction[];
  unchangedTransactions: Transaction[];
  wholesaler_id: number;  
  total24kProductIn: number;
  total24kProductOut: number;
  total24kScrapIn: number;
  total24kScrapOut: number;
  total24kIn: number;
  total24kOut: number;
  totalCashIn: number;
  totalCashOut: number;
  totalBankIn: number;
  totalBankOut: number;
} 