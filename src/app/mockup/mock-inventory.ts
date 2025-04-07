import { Inventory } from '../interfaces/inventory.interface';
import { mockProducts } from './mock-products';


let mockProductsWithQuantity = [
    {
        product: mockProducts[0],
        quantity: 11
    },
    {
        product: mockProducts[1],
        quantity: 14
    },
    {
        product: mockProducts[2],
        quantity: 7
    },
    {
        product: mockProducts[3],
        quantity: 5
    }
]
let totalCash = 2350;
let totalBank = 4820;
let totalScrap24k = 113.46;
let totalProducts24k = mockProductsWithQuantity.reduce((acc, curr) => acc + curr.product.total24k * curr.quantity, 0);
let total24k = totalScrap24k + totalProducts24k;




export const mockInventory: Inventory = {
  productsWithQuantity: mockProductsWithQuantity,
  totalCash,
  totalBank,
  totalScrap24k,
  totalProducts24k,
  total24k
};
