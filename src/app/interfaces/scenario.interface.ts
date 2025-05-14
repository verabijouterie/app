import { Transaction } from './transaction.interface';

export interface Scenario {
  id: number | null;
  date: string;
  description: string;
  transactions: Transaction[];

  agreedGoldRate: number;
  
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
} 