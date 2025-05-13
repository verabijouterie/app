import { CARAT_OPTIONS } from "../config/constants";
import { Category } from "./category.interface";


export interface Product {
  id: number | null;
  is_gold: boolean;
  contains_gold: boolean;
  name: string;
  carat: typeof CARAT_OPTIONS[number] | null;
  weight_brut: number | null;
  weight24k: number | null;
  category_id: number | null;
  category?: Category;
} 
