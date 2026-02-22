import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

interface MarketPrice {
  commodity: string;
  variety: string;
  market: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  date: string;
  trend?: 'up' | 'down' | 'stable';
  exchange?: string;
}

interface Fertilizer {
  name: string;
  price: number;
  unit: string;
  subsidy: boolean;
}

const mockFertilizers: Fertilizer[] = [
  { name: 'Urea', price: 266, unit: 'per 50kg bag', subsidy: true },
  { name: 'DAP', price: 1350, unit: 'per 50kg bag', subsidy: true },
  { name: 'MOP', price: 1700, unit: 'per 50kg bag', subsidy: true },
  { name: 'NPK 10:26:26', price: 1450, unit: 'per 50kg bag', subsidy: true },
  { name: 'Single Super Phosphate', price: 450, unit: 'per 50kg bag', subsidy: true },
  { name: 'Zinc Sulphate', price: 580, unit: 'per 25kg bag', subsidy: false },
  { name: 'Gypsum', price: 350, unit: 'per 50kg bag', subsidy: false },
  { name: 'Organic Compost', price: 250, unit: 'per 50kg bag', subsidy: false },
];

const API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY;

export default function MarketPrices() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [marketData, setMarketData] = useState<MarketPrice[]>([]);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>(mockFertilizers);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadingFert, setLoadingFert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [availableStates, setAvailableStates] = useState<string[]>(["All States"]);
  const { toast } = useToast();



  const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
};

const getToday = () => {
  return formatDate(new Date());
};

const fetchMarketPrices = async () => {
  if (!API_KEY) return;
  setLoadingMarket(true);

  try {
    const today = getToday();
    const yesterday = getYesterday();

    const todayRes = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=500&filters[arrival_date]=${today}`
    );

    const yesterdayRes = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=500&filters[arrival_date]=${yesterday}`
    );

    if (!todayRes.ok) throw new Error("API error");

    const todayDataRaw = await todayRes.json();
const yesterdayData = yesterdayRes.ok ? await yesterdayRes.json() : { records: [] };

// Fallback if today has no data
const todayData = todayDataRaw.records.length > 0 
  ? todayDataRaw 
  : yesterdayData;

  // Create lookup map for yesterday
    const yesterdayMap: Record<string, number> = {};

    for (const item of yesterdayData.records) {
      const key = `${item.state}_${item.market}_${item.commodity}`;
      yesterdayMap[key] = Number(item.modal_price);
    }

    const records = todayData.records;

const selected: MarketPrice[] = [];
const uniqueCommodities = new Set<string>();
const stateCount: Record<string, number> = {};

// PASS 1 → Ensure at least 1 per state
for (const item of records) {
  if (selected.length >= 50) break;

  const state = item.state;
  const commodityName = item.commodity;

  if (!stateCount[state] && !uniqueCommodities.has(commodityName)) {

    const key = `${item.state}_${item.market}_${item.commodity}`;
    const todayPrice = Number(item.modal_price);
    const yesterdayPrice = yesterdayMap[key];

    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (yesterdayPrice !== undefined) {
      if (todayPrice > yesterdayPrice) trend = 'up';
      else if (todayPrice < yesterdayPrice) trend = 'down';
    }

    selected.push({
      commodity: item.commodity,
      variety: item.variety,
      market: item.market,
      state: item.state,
      min_price: Number(item.min_price),
      max_price: Number(item.max_price),
      modal_price: todayPrice,
      unit: "Quintal",
      date: item.arrival_date,
      trend,
      exchange: item.market
    });

    uniqueCommodities.add(commodityName);
    stateCount[state] = 1;
  }
}

// PASS 2 → Fill remaining (max 3 per state)
for (const item of records) {
  if (selected.length >= 50) break;

  const state = item.state;
  const commodityName = item.commodity;

  if ((stateCount[state] || 0) < 3 && !uniqueCommodities.has(commodityName)) {

    const key = `${item.state}_${item.market}_${item.commodity}`;
    const todayPrice = Number(item.modal_price);
    const yesterdayPrice = yesterdayMap[key];

    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (yesterdayPrice !== undefined) {
      if (todayPrice > yesterdayPrice) trend = 'up';
      else if (todayPrice < yesterdayPrice) trend = 'down';
    }

    selected.push({
      commodity: item.commodity,
      variety: item.variety,
      market: item.market,
      state: item.state,
      min_price: Number(item.min_price),
      max_price: Number(item.max_price),
      modal_price: todayPrice,
      unit: "Quintal",
      date: item.arrival_date,
      trend,
      exchange: item.market
    });

    uniqueCommodities.add(commodityName);
    stateCount[state] = (stateCount[state] || 0) + 1;
  }
}



    setMarketData(selected);
    const uniqueStates = Array.from(
  new Set(selected.map(item => item.state))
);

setAvailableStates(["All States", ...uniqueStates.sort()]);
    setLastUpdate(new Date());

  } catch {
    toast({
      title: i18n.t("Failed to fetch market prices"),
      variant: "destructive"
    });
  } finally {
    setLoadingMarket(false);
  }
};


  const fetchFertilizerPrices = async () => {
  setLoadingFert(true);
  try {
    setFertilizers(mockFertilizers);
  } catch {
    toast({
      title: i18n.t("Failed to fetch fertilizer prices"),
      variant: "destructive"
    });
  } finally {
    setLoadingFert(false);
  }
};

  useEffect(() => {
  if (!API_KEY) return;

  fetchMarketPrices();
  fetchFertilizerPrices();
}, []);

  const filteredData = marketData.filter(item=>{
    const matchesSearch = item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.market.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState==='All States' || item.state===selectedState;
    return matchesSearch && matchesState;
  });

  const getTrendIcon=(trend?:string)=>{
    if(trend==='up') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if(trend==='down') return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor=(trend?:string)=>{
    if(trend==='up') return 'text-green-400';
    if(trend==='down') return 'text-red-400';
    return 'text-muted-foreground';
  };

  

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent animate-text">
              {i18n.t('Real-Time Market & Fertilizer Prices')}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              {i18n.t('Latest official mandi prices from government data')}
            </p>
            {lastUpdate && <p className="mt-2 text-sm text-gray-500">{i18n.t('Last updated')}: {lastUpdate.toLocaleString('en-IN')}</p>}
          </div>

          <Tabs defaultValue="crops" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 mb-8 gap-2">
              <TabsTrigger value="crops" className="bg-white/50 backdrop-blur-md shadow-lg hover:scale-105 transition-transform">
                {i18n.t('Commodity Prices')}
              </TabsTrigger>
              <TabsTrigger value="fertilizers" className="bg-white/50 backdrop-blur-md shadow-lg hover:scale-105 transition-transform">
                {i18n.t('Fertilizers')}
              </TabsTrigger>
            </TabsList>

            {/* Commodity Tab */}
            <TabsContent value="crops" className="space-y-8">
              <Card className="bg-white/40 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow rounded-xl">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input placeholder={i18n.t("Search by commodity, variety, or market...")} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="pl-10 bg-white/70 backdrop-blur-md" />
                    </div>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="w-full md:w-[200px] bg-white/70 backdrop-blur-md">
                        <SelectValue placeholder={i18n.t("Select State")} />
                      </SelectTrigger>
                      <SelectContent>{availableStates.map(state => (
  <SelectItem key={state} value={state}>
    {i18n.t(state)}
  </SelectItem>
))}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-purple-600">{i18n.t('Live Commodity Rates')}</CardTitle>
                  <CardDescription>{i18n.t('Prices converted to ₹')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMarket ? <p>{i18n.t('Loading market prices...')}</p> : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="bg-white/60 backdrop-blur-md">
                        <TableHeader>
                          <TableRow>
                            <TableHead>{i18n.t('Commodity')}</TableHead>
                            <TableHead>{i18n.t('Variety')}</TableHead>
                            <TableHead>{i18n.t('Exchange')}</TableHead>
                            <TableHead>{i18n.t('State')}</TableHead>
                            <TableHead className="text-right">{i18n.t('Min Price')}</TableHead>
                            <TableHead className="text-right">{i18n.t('Max Price')}</TableHead>
                            <TableHead className="text-right">{i18n.t('Modal Price')}</TableHead>
                            <TableHead className="text-center">{i18n.t('Trend')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.length>0 ? filteredData.map((item,index)=>(
                            <TableRow key={index} className="hover:bg-purple-50 transition-colors rounded-lg">
                              <TableCell className="font-medium">{item.commodity}</TableCell>
                              <TableCell>{item.variety}</TableCell>
                              <TableCell><Badge variant="outline">{item.market}</Badge></TableCell>
                              <TableCell><Badge variant="secondary">{item.state}</Badge></TableCell>
                              <TableCell className="text-right">₹{item.min_price.toLocaleString('en-IN')}/{item.unit}</TableCell>
                              <TableCell className="text-right">₹{item.max_price.toLocaleString('en-IN')}/{item.unit}</TableCell>
                              <TableCell className="text-right font-semibold">₹{item.modal_price.toLocaleString('en-IN')}/{item.unit}</TableCell>
                              <TableCell className="text-center flex items-center justify-center gap-1">
                                {getTrendIcon(item.trend)}
                                <span className={`text-xs ${getTrendColor(item.trend)}`}>{item.trend ? i18n.t(item.trend) : ''}</span>
                              </TableCell>
                            </TableRow>
                          )) : <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">{i18n.t('No data found')}</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fertilizers Tab */}
            <TabsContent value="fertilizers" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loadingFert ? <p>{i18n.t('Loading fertilizers...')}</p> : fertilizers.map((fert,index)=>(
                  <Card key={index} className="bg-white/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow rounded-xl hover:scale-105">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-pink-600">{i18n.t(fert.name)}</CardTitle>
                      <CardDescription>{i18n.t(fert.unit)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-extrabold text-purple-600 mb-2">₹{fert.price.toLocaleString('en-IN')}</div>
                      <Badge variant={fert.subsidy?'default':'secondary'}>{fert.subsidy ? i18n.t('Subsidized') : i18n.t('Non-Subsidized')}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
