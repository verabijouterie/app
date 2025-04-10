import { Product } from "./product.interface";
import { CARAT_OPTIONS } from "../config/constants";


export interface Transaction {
  id?: number;
  type: "Product" | "Scrap" | "Cash" | "Bank";
  direction: "In" | "Out";
  gold_rate?: number;
  row_index?: number;
  product_id?: number;
  product?: Product;
  weight?: number; // in grams
  carat?: typeof CARAT_OPTIONS[number];//
  amount?: number; // in euro
  quantity?: number;
  weight24k?: number; // in grams
}