import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="mb-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center glow-effect">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">CryptoHub</h1>
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track cryptocurrency prices, market caps, and trending coins in real-time. 
          Powered by CoinGecko API with live market data.
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Global Market</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Live Prices</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Real-time Data</span>
          </div>
        </div>
      </div>
    </header>
  );
}