import { Product } from "./product.interface";
import { CARAT_OPTIONS } from "../config/constants";


export interface Transaction {
  id?: number;
  type: "Product" | "Scrap" | "Cash" | "Bank" | "Money";
  direction: "In" | "Out";
  context?: "Supply" | "Order" | "Scenario";
  row_index?: number;
  agreed_gold_rate?: number;

  
  //type product
  product_id?: number;
  product?: Product;
  quantity?: number;
  //type product -> context order -> direction out
  status: 'ToBeOrdered' | 'AwaitingWholesaler' | 'AwaitingCustomer' | 'HandedOut' | null;

  //type product and scrap
  weight_brut?: number; // in grams
  carat?: typeof CARAT_OPTIONS[number];
  weight24k?: number; // in gram
  agreed_milliemes?: number;
  agreed_weight24k?: number;
  agreed_price?: number;


  paiable_as_cash_only?: boolean;
  
  
  //type money
  amount?: number; 
  

}