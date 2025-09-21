import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import CoinGeckoAPI from '@/services/api';
import { GlobalMarketData } from '@/types/crypto';
import { formatMarketCap, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export function MarketStats() {
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CoinGeckoAPI.getGlobalData();
        setGlobalData(data);
      } catch (err) {
        setError('Failed to fetch global market data');
        console.error('Error fetching global data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchGlobalData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="crypto-card animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !globalData) {
    return (
      <Card className="crypto-card mb-8">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const { data } = globalData;
  const totalMarketCap = data.total_market_cap.usd;
  const totalVolume = data.total_volume.usd;
  const marketCapChange = data.market_cap_change_percentage_24h_usd;
  const btcDominance = data.market_cap_percentage.btc;

  const marketCapPercentage = formatPercentage(marketCapChange);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="crypto-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Market Cap
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold gradient-text">
            {formatMarketCap(totalMarketCap)}
          </div>
          <div className="flex items-center mt-2">
            {marketCapChange >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-danger" />
            )}
            <span className={`text-xs ${marketCapPercentage.className}`}>
              {marketCapPercentage.formatted}
            </span>
            <span className="text-xs text-muted-foreground ml-1">24h</span>
          </div>
        </CardContent>
      </Card>

      <Card className="crypto-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            24h Volume
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatMarketCap(totalVolume)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total trading volume
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            BTC Dominance
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {btcDominance.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Bitcoin market share
          </p>
        </CardContent>
      </Card>

      <Card className="crypto-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Cryptos
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.active_cryptocurrencies.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total cryptocurrencies
          </p>
        </CardContent>
      </Card>
    </div>
  );
}