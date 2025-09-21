import { Header } from '@/components/layout/header';
import { MarketStats } from '@/components/crypto/market-stats';
import { Highlights } from '@/components/crypto/highlights';
import { CoinsTable } from '@/components/crypto/coins-table';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Header />
        <MarketStats />
        <Highlights />
        <CoinsTable />
      </div>
    </div>
  );
}