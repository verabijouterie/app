import { Transaction } from './transaction.interface';
import { Wholesaler } from './wholesaler.interface';

export interface Supply {
  id: number | null;
  date: string;
  description: string;
  transactions: Transaction[];
  wholesaler_id: number;  


  agreedTotalProductsInAs24K: number;
  agreedTotalProductsOutAs24K: number;
  agreedTotalScrapInAs24K: number;
  agreedTotalScrapOutAs24K: number;
  agreedTotalMoneyInAs24K: number;
  agreedTotalMoneyOutAs24K: number;
  agreedTotalInAs24K: number;
  agreedTotalOutAs24K: number;
  agreedTotalAs24K: number;

  agreedTotalProductsInAsMoney: number;
  agreedTotalProductsOutAsMoney: number;
  agreedTotalScrapInAsMoney: number;
  agreedTotalScrapOutAsMoney: number;
  agreedTotalMoneyInAsMoney: number;
  agreedTotalMoneyOutAsMoney: number;
  agreedTotalInAsMoney: number;
  agreedTotalOutAsMoney: number;
  agreedTotalAsMoney: number;

} 