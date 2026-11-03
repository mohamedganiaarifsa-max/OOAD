/**
 * Currency Formatting Utility for PetCare Smart Pet Take Care Management System
 * Standardized for Indian Rupees (INR – ₹) using the Indian numbering system (en-IN).
 */

/**
 * Formats a numeric value into an Indian Rupee currency string.
 * Examples:
 *   formatINR(950) => "₹950"
 *   formatINR(2500) => "₹2,500"
 *   formatINR(10000) => "₹10,000"
 *   formatINR(125000) => "₹1,25,000"
 *   formatINR(2500.5) => "₹2,500.50"
 */
export function formatINR(
  amount: number,
  options?: {
    hideDecimals?: boolean;
    decimals?: number;
  }
): string {
  const num = Number(amount) || 0;
  const hasFraction = num % 1 !== 0;

  const minFraction =
    options?.hideDecimals
      ? 0
      : options?.decimals !== undefined
      ? options.decimals
      : hasFraction
      ? 2
      : 0;

  const maxFraction =
    options?.hideDecimals
      ? 0
      : options?.decimals !== undefined
      ? options.decimals
      : 2;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
    }).format(num);
  } catch {
    // Fallback if Intl is unavailable or fails
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
    });
    return `₹${formatted}`;
  }
}

/**
 * Formats a raw number according to the Indian numbering system without currency symbol.
 * Example: formatINRNumber(125000) => "1,25,000"
 */
export function formatINRNumber(num: number): string {
  return (Number(num) || 0).toLocaleString('en-IN');
}
