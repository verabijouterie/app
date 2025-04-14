import { CARAT_OPTIONS } from "../config/constants";
import { Category } from "./category.interface";


export interface Product {
  id?: number;
  name: string;
  carat?: typeof CARAT_OPTIONS[number];//
  weight?: number;
  weight24k?: number;
  inventory?: number;
  category_id?: number;
  category?: Category;
} 
