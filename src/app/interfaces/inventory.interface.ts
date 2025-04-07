import { Product } from './product.interface';


export interface Inventory {
  products: Product[];
  totalCash: number;
  totalBank: number;
  totalScrap24k: number;
  totalProducts24k: number;
  total24k: number;
}
