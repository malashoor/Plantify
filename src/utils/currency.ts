export function formatCurrency(price: string, currency: string): string {
  const numericPrice = parseFloat(price);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}
