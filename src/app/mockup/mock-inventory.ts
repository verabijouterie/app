import { Inventory } from '../interfaces/inventory.interface';
import { mockProducts } from './mock-products';



let totalCash = 2350;
let totalBank = 4820;
let totalScrap24k = 113.46;
let totalProducts24k = mockProducts.reduce((acc, curr) => acc + curr.total24k * curr.inventory, 0);
let total24k = totalScrap24k + totalProducts24k;


export const mockInventory: Inventory = {
  products: mockProducts,
  totalCash,
  totalBank,
  totalScrap24k,
  totalProducts24k,
  total24k
};
