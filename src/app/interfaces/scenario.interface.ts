import { User } from './user.interface';
import { Transaction } from './transaction.interface';

export interface Scenario {
  id?: number;
  date: Date;
  user_id: number;
  description: string;
  transactions: Transaction[];
  currentRate: number;
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