import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading-spinner';
import CoinGeckoAPI from '@/services/api';
import { Coin } from '@/types/crypto';
import { formatPrice, formatMarketCap, formatPercentage, formatRank, debounce } from '@/utils/formatters';
import { 
  Search, 
  ArrowUpDown,
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const columnHelper = createColumnHelper<Coin>();

export function CoinsTable() {
  const [data, setData] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('market_cap_rank', {
        id: 'rank',
        header: '#',
        cell: (info) => (
          <span className="font-medium text-muted-foreground">
            {formatRank(info.getValue())}
          </span>
        ),
        size: 60,
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        cell: (info) => {
          const coin = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{coin.name}</p>
                <p className="text-sm text-muted-foreground uppercase">
                  {coin.symbol}
                </p>
              </div>
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor('current_price', {
        id: 'price',
        header: 'Price',
        cell: (info) => (
          <span className="font-medium">
            {formatPrice(info.getValue())}
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor('price_change_percentage_1h_in_currency', {
        id: 'change_1h',
        header: '1h %',
        cell: (info) => {
          const value = info.getValue();
          if (value === null || value === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatPercentage(value);
          return (
            <div className="flex items-center gap-1">
              {formatted.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className={formatted.className}>
                {formatted.formatted}
              </span>
            </div>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('price_change_percentage_24h', {
        id: 'change_24h',
        header: '24h %',
        cell: (info) => {
          const value = info.getValue();
          if (value === null || value === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatPercentage(value);
          return (
            <div className="flex items-center gap-1">
              {formatted.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className={formatted.className}>
                {formatted.formatted}
              </span>
            </div>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('price_change_percentage_7d_in_currency', {
        id: 'change_7d',
        header: '7d %',
        cell: (info) => {
          const value = info.getValue();
          if (value === null || value === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatPercentage(value);
          return (
            <div className="flex items-center gap-1">
              {formatted.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className={formatted.className}>
                {formatted.formatted}
              </span>
            </div>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('total_volume', {
        id: 'volume',
        header: '24h Volume',
        cell: (info) => (
          <span className="font-medium">
            {formatMarketCap(info.getValue())}
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor('market_cap', {
        id: 'market_cap',
        header: 'Market Cap',
        cell: (info) => (
          <span className="font-medium">
            {formatMarketCap(info.getValue())}
          </span>
        ),
        size: 140,
      }),
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(value), 300),
    []
  );

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const marketData = await CoinGeckoAPI.getMarketData({
          order: 'market_cap_desc',
          per_page: 250, // Fetch more data for better filtering/searching
          price_change_percentage: '1h,24h,7d',
          sparkline: false,
        });
        
        setData(marketData);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    // Refresh every 2 minutes
    const interval = setInterval(fetchMarketData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Cryptocurrency Prices by Market Cap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={10} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="crypto-card">
        <CardContent className="p-6 text-center">
          <p className="text-danger">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cryptocurrency Prices by Market Cap
          <Badge variant="secondary" className="ml-auto">
            {data.length} coins
          </Badge>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search cryptocurrencies..."
              className="pl-10"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-2 hover:text-foreground transition-colors'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1 text-sm">
              <span>Page</span>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}