import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingCard } from '@/components/ui/loading-spinner';
import CoinGeckoAPI from '@/services/api';
import { Coin, TrendingResponse } from '@/types/crypto';
import { formatPrice, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Star, Zap } from 'lucide-react';

interface HighlightCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export function Highlights() {
  const [trendingCoins, setTrendingCoins] = useState<HighlightCoin[]>([]);
  const [topGainers, setTopGainers] = useState<Coin[]>([]);
  const [topLosers, setTopLosers] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true);
        
        // Fetch trending coins
        const trendingData = await CoinGeckoAPI.getTrending();
        
        // Fetch market data to get top gainers and losers
        const marketData = await CoinGeckoAPI.getMarketData({
          order: 'gecko_desc',
          per_page: 100,
          price_change_percentage: '24h',
        });
        
        // Process trending coins (get their current prices)
        const trendingIds = trendingData.coins.slice(0, 8).map(coin => coin.item.id);
        const trendingWithPrices = marketData.filter(coin => 
          trendingIds.includes(coin.id)
        ).slice(0, 8);
        
        // Sort by 24h change to get top gainers and losers
        const sorted = [...marketData].sort((a, b) => 
          b.price_change_percentage_24h - a.price_change_percentage_24h
        );
        
        const gainers = sorted.slice(0, 8).filter(coin => 
          coin.price_change_percentage_24h > 0
        );
        const losers = sorted.slice(-8).filter(coin => 
          coin.price_change_percentage_24h < 0
        ).reverse();
        
        setTrendingCoins(trendingWithPrices);
        setTopGainers(gainers);
        setTopLosers(losers);
      } catch (error) {
        console.error('Error fetching highlights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHighlights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-6">Market Highlights</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Coins */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Trending Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingCoins.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(coin.current_price)}
                      </p>
                      {coin.price_change_percentage_24h && (
                        <p className={`text-xs ${
                          formatPercentage(coin.price_change_percentage_24h).className
                        }`}>
                          {formatPercentage(coin.price_change_percentage_24h).formatted}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Gainers */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Gainers
                <Badge variant="secondary" className="ml-auto">24h</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topGainers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(coin.current_price)}
                      </p>
                      <p className="text-xs price-up">
                        {formatPercentage(coin.price_change_percentage_24h).formatted}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-danger" />
                Top Losers
                <Badge variant="secondary" className="ml-auto">24h</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLosers.map((coin, index) => (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatPrice(coin.current_price)}
                      </p>
                      <p className="text-xs price-down">
                        {formatPercentage(coin.price_change_percentage_24h).formatted}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}