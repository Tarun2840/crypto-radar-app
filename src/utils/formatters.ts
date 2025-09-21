/**
 * Utility functions for formatting cryptocurrency data
 */

/**
 * Format price with appropriate decimal places and currency symbol
 */
export function formatPrice(price: number, currency = 'USD'): string {
  if (price === 0) return '$0.00';
  
  if (price < 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(price);
  }
  
  if (price < 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(price);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format market cap or volume with appropriate suffixes (B, M, K)
 */
export function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format percentage change with appropriate color class
 */
export function formatPercentage(percentage: number): {
  formatted: string;
  className: string;
  isPositive: boolean;
} {
  const isPositive = percentage >= 0;
  const formatted = `${isPositive ? '+' : ''}${percentage.toFixed(2)}%`;
  const className = isPositive ? 'price-up' : 'price-down';
  
  return {
    formatted,
    className,
    isPositive,
  };
}

/**
 * Format supply numbers with appropriate suffixes
 */
export function formatSupply(supply: number): string {
  if (supply >= 1e12) {
    return `${(supply / 1e12).toFixed(2)}T`;
  }
  if (supply >= 1e9) {
    return `${(supply / 1e9).toFixed(2)}B`;
  }
  if (supply >= 1e6) {
    return `${(supply / 1e6).toFixed(2)}M`;
  }
  if (supply >= 1e3) {
    return `${(supply / 1e3).toFixed(2)}K`;
  }
  return supply.toLocaleString();
}

/**
 * Format rank with # prefix
 */
export function formatRank(rank: number): string {
  return `#${rank}`;
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}