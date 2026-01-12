import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  priceChange1y: number;
  high24h: number;
  low24h: number;
  ath: number;
  athDate: string;
  athChangePercentage: number;
  atl: number;
  atlDate: string;
  atlChangePercentage: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  sparkline7d: number[];
  lastUpdated: string;
}

export interface StockData {
  symbol: string;
  name: string;
  description: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  peRatio: number;
  pegRatio: number;
  beta: number;
  eps: number;
  dividendYield: number;
  dividendPerShare: number;
  profitMargin: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayMA: number;
  twoHundredDayMA: number;
  analystTargetPrice: number;
  forwardPE: number;
  priceToBook: number;
  priceToSales: number;
  bookValue: number;
  revenuePerShare: number;
  returnOnEquity: number;
  returnOnAssets: number;
  lastUpdated: string;
}

export interface ETFData {
  symbol: string;
  name: string;
  description: string | null;
  assetType: string;
  exchange: string | null;
  sector: string | null;
  currentPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayMA: number;
  twoHundredDayMA: number;
  beta: number;
  dividendYield: number;
  lastUpdated: string;
}

export function useCryptoData(page = 1, perPage = 100) {
  const [data, setData] = useState<CryptoData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: response, error: fnError } = await supabase.functions.invoke('fetch-crypto-data', {
        body: { page, perPage }
      });

      if (fnError) throw fnError;
      
      setData(response.crypto || []);
      setTotal(response.total || response.crypto?.length || 0);
      setLastFetch(new Date());
    } catch (err: any) {
      console.error('Error fetching crypto data:', err);
      setError(err.message || 'Failed to fetch crypto data');
      toast.error('Failed to fetch crypto data');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, total, loading, error, lastFetch, refetch: fetchData };
}

export function useStockData(page = 1, perPage = 50) {
  const [data, setData] = useState<StockData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: response, error: fnError } = await supabase.functions.invoke('fetch-stock-quotes', {
        body: { page, perPage }
      });

      if (fnError) throw fnError;
      
      setData(response.stocks || []);
      setTotal(response.total || 0);
      setLastFetch(new Date());
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      setError(err.message || 'Failed to fetch stock data');
      toast.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, total, loading, error, lastFetch, refetch: fetchData };
}

export function useETFData(symbols?: string[]) {
  const [data, setData] = useState<ETFData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: response, error: fnError } = await supabase.functions.invoke('fetch-etf-data', {
        body: { symbols }
      });

      if (fnError) throw fnError;
      
      setData(response.etfs || []);
      setLastFetch(new Date());
    } catch (err: any) {
      console.error('Error fetching ETF data:', err);
      setError(err.message || 'Failed to fetch ETF data');
      toast.error('Failed to fetch ETF data');
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastFetch, refetch: fetchData };
}

// Combined hook for all market data
export function useAllMarketData() {
  const cryptoHook = useCryptoData();
  const stockHook = useStockData();
  const etfHook = useETFData();

  const loading = cryptoHook.loading || stockHook.loading || etfHook.loading;
  
  const refetchAll = useCallback(async () => {
    await Promise.all([
      cryptoHook.refetch(),
      stockHook.refetch(),
      etfHook.refetch(),
    ]);
  }, [cryptoHook.refetch, stockHook.refetch, etfHook.refetch]);

  return {
    crypto: cryptoHook,
    stocks: stockHook,
    etfs: etfHook,
    loading,
    refetchAll,
  };
}
