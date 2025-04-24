import { Product } from "./product.interface";
import { CARAT_OPTIONS } from "../config/constants";


export interface Transaction {
  id?: number;
  type: "Product" | "Scrap" | "Cash" | "Bank";
  direction: "In" | "Out";
  row_index?: number;
  product_id?: number;
  product?: Product;
  weight?: number; // in grams
  carat?: typeof CARAT_OPTIONS[number];//
  amount?: number; // in euro
  quantity?: number;
  weight24k?: number; // in grams
  status: 'ToBeOrdered' | 'AwaitingWholesaler' | 'AwaitingCustomer' | 'HandedOut' | null; //is set only if order_id !=null && type=Product && direction=Out
  agreed_gold_rate?: number; //is set only if supply_id !=null && (type=Cash || type=Bank)
}