import { Header } from '@/components/layout/header';
import { MarketStats } from '@/components/crypto/market-stats';
import { Highlights } from '@/components/crypto/highlights';
import { CoinsTable } from '@/components/crypto/coins-table';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <MarketStats />
        <Highlights />
        <CoinsTable />
      </div>
    </div>
  );
}