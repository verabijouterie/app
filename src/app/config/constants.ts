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

export const CARAT_PURITY_MAP_SCRAP: { [key: number]: number } = {
  24: 0.985,
  22: 0.910,
  21: 0.850,
  18: 0.730,
  14: 0.565,
  9: 0.350,
  8: 0.300
}; 

export const STATUS_OPTIONS = [
  { key: 'ToBeOrdered', value: 'Toptancıdan Sipariş Edilecek' , priority: 1},
  { key: 'AwaitingWholesaler', value: 'Toptancı Bekleniyor' , priority: 2},
  { key: 'AwaitingCustomer', value: 'Müşteri Bekleniyor' , priority: 3},
  { key: 'Pending', value: 'Beklemede' , priority: 4},
  { key: 'Delivered', value: 'Teslim Edildi' , priority: 5},
  { key: 'Received', value: 'Teslim Alındı' , priority: 6},
  /*{ key: 'Cancelled', value: 'İptal Edildi' },*/
  { key: 'Completed', value: 'Tamamlandı' , priority: 7},
];

