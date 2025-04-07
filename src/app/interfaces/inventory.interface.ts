import { Product } from './product.interface';

export interface ProductsWithQuantity {
  product: Product;
  quantity: number;
}

export interface Inventory {
  productsWithQuantity: ProductsWithQuantity[];
  totalCash: number;
  totalBank: number;
  totalScrap24k: number;
  totalProducts24k: number;
  total24k: number;
}
