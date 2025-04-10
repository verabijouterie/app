import { Category } from "./category.interface";

export interface Product {
  id?: number;
  name: string;
  carat?: 24 | 22 | 21 | 20 | 18 | 16 | 14 | 12 | 10 | 8;
  weight?: number;
  weight24k?: number;
  inventory?: number;
  category_id?: number;
  category?: Category;
} 
