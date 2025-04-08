import { Product } from "./product.interface";


export interface Transaction {
  id?: number;
  type: "Product" | "Scrap" | "Cash" | "Bank";
  direction: "In" | "Out";
  row_index?: number;
  product_id?: number;
  product?: Product;
  weight?: number; // in grams
  carat?: 24 | 22 | 21 | 20 | 18 | 16 | 14 | 12 | 10 | 8;//
  amount?: number; // in euro
  quantity?: number;
  total24KWeight?: number; // in grams
}