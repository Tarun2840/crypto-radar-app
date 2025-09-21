import axios from 'axios';
import { Coin, TrendingResponse, GlobalMarketData } from '@/types/crypto';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key if available (for rate limiting improvements)
if (import.meta.env.VITE_COINGECKO_API_KEY) {
  api.defaults.headers.common['x-cg-demo-api-key'] = import.meta.env.VITE_COINGECKO_API_KEY;
}

export class CoinGeckoAPI {
  /**
   * Fetch market data for cryptocurrencies with pagination and sorting
   */
  static async getMarketData({
    vs_currency = 'usd',
    order = 'market_cap_desc',
    per_page = 50,
    page = 1,
    sparkline = false,
    price_change_percentage = '1h,24h,7d',
  }: {
    vs_currency?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
  } = {}): Promise<Coin[]> {
    try {
      const response = await api.get('/coins/markets', {
        params: {
          vs_currency,
          order,
          per_page,
          page,
          sparkline,
          price_change_percentage,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  /**
   * Fetch trending cryptocurrencies
   */
  static async getTrending(): Promise<TrendingResponse> {
    try {
      const response = await api.get('/search/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending data:', error);
      throw new Error('Failed to fetch trending data');
    }
  }

  /**
   * Fetch global market data including total market cap
   */
  static async getGlobalData(): Promise<GlobalMarketData> {
    try {
      const response = await api.get('/global');
      return response.data;
    } catch (error) {
      console.error('Error fetching global data:', error);
      throw new Error('Failed to fetch global market data');
    }
  }

  /**
   * Search for cryptocurrencies by query
   */
  static async searchCoins(query: string): Promise<any> {
    try {
      const response = await api.get('/search', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching coins:', error);
      throw new Error('Failed to search coins');
    }
  }

  /**
   * Fetch detailed information for a specific coin
   */
  static async getCoinDetails(coinId: string): Promise<any> {
    try {
      const response = await api.get(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching coin details for ${coinId}:`, error);
      throw new Error('Failed to fetch coin details');
    }
  }
}

export default CoinGeckoAPI;