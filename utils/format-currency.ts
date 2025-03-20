import { useCurrency } from "@/context/currency-context"

/**
 * Format a number as currency using the current app currency
 * @param amount - The amount to format
 * @param options - NumberFormat options
 * @returns Formatted currency string
 */
export function useFormatCurrency() {
  const { currentCurrency } = useCurrency()
  
  return (amount: number, options?: Intl.NumberFormatOptions) => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currentCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    }

    return new Intl.NumberFormat('en-US', defaultOptions).format(amount)
  }
}

/**
 * Format a number as currency using a specific currency code
 * @param amount - The amount to format
 * @param currencyCode - The currency code to use
 * @param options - NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string, options?: Intl.NumberFormatOptions) {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }

  return new Intl.NumberFormat('en-US', defaultOptions).format(amount)
}