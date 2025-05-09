import { Product } from "./product.interface";
import { CARAT_OPTIONS } from "../config/constants";


export interface Transaction {
  id: number | null;
  date: string;
  type: "Product" | "Scrap" | "Cash" | "Bank" | "Money";
  direction: "In" | "Out";
  
  //type product
  product_id: number | null;
  product: Product | null;
  quantity: number | null;
  //type product -> context order -> direction out
  status: 'ToBeOrdered' | 'AwaitingWholesaler' | 'AwaitingCustomer' | 'HandedOut' | undefined | null;

  //type product and scrap
  weight_brut: number | null; // in grams
  weight_brut_total: number | null; // in grams
  carat: typeof CARAT_OPTIONS[number] | null;
  weight24k: number | null; // in gram
  agreed_milliemes: number | null;
  agreed_weight24k: number | null;
  agreed_price: number | null;


  paiable_as_cash_only: boolean | null;
  
  
  //type money
  amount: number | null; 

}