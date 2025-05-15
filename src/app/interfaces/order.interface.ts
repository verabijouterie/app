import { Transaction } from './transaction.interface';
import { STATUS_OPTIONS } from '../config/constants';

export interface Order {
  id: number | null;
  date: string;
  description: string;
  client_name: string;
  client_phone: string;
  transactions: Transaction[];

  agreedGoldRate: number;
  
  totalProductInAsMoney: number;
  totalProductInAsMoneyPending: number;
  totalProductOutAsMoney: number;
  totalProductOutAsMoneyPending: number;
  totalScrapInAsMoney: number;
  totalScrapInAsMoneyPending: number;
  totalScrapOutAsMoney: number;
  totalScrapOutAsMoneyPending: number;
  
  totalCashIn: number;
  totalCashInPending: number;
  totalCashOut: number;
  totalCashOutPending: number;
  totalBankIn: number;
  totalBankInPending: number;
  totalBankOut: number;
  totalBankOutPending: number;
  
  total24kProductIn: number;
  total24kProductInPending: number;
  total24kProductOut: number;
  total24kProductOutPending: number;
  total24kScrapIn: number;
  total24kScrapInPending: number;
  total24kScrapOut: number;
  total24kScrapOutPending: number;
  total24kIn: number;
  total24kInPending: number;
  total24kOut: number;
  total24kOutPending: number;
  total24k: number;
  total24kPending: number;
  
  
  totalMoneyIn: number;
  totalMoneyInPending: number;
  totalMoneyOut: number;
  totalMoneyOutPending: number;
  totalMoney: number;
  totalMoneyPending: number;
  
  grandTotalAsMoney: number; //Pending + completed

  status: typeof STATUS_OPTIONS[number]['key'] | null;

} 


