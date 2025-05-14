import { Transaction } from './transaction.interface';
import { STATUS_OPTIONS } from '../config/constants';

export interface Order {
  id: number | null;
  date: string;
  description: string;
  client_name: string;
  client_phone: string;
  
  order_amount: number;

  agreedGoldRate: number;
  
  transactions: Transaction[];

  total24kProductIn: number;
  total24kProductOut: number;
  total24kScrapIn: number;
  total24kScrapOut: number;
  total24kIn: number;
  total24kOut: number;
  total24k: number;
  totalCashIn: number;
  totalCashOut: number;
  totalBankIn: number;
  totalBankOut: number;
  totalMoneyIn: number;
  totalMoneyOut: number;
  totalMoney: number;
  status: typeof STATUS_OPTIONS[number]['key'] | null;

} 