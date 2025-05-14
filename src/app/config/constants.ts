export const CARAT_OPTIONS: number[] = [22, 21, 18, 14, 9, 8, 24];

export const CARAT_PURITY_MAP_GOLD: { [key: number]: number } = {
  24: 0.999,
  22: 0.916,
  21: 0.875,
  18: 0.750,
  14: 0.585,
  9: 0.375,
  8: 0.333
}; 

export const STATUS_OPTIONS = [
  { key: 'ToBeOrdered', value: 'Toptancıdan Sipariş Edilecek' },
  { key: 'AwaitingWholesaler', value: 'Toptancı Bekleniyor' },
  { key: 'AwaitingCustomer', value: 'Müşteri Bekleniyor' },
  { key: 'Pending', value: 'Beklemede' },
  { key: 'Completed', value: 'Tamamlandı' },

];

