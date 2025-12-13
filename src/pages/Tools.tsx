import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Bot, Search } from 'lucide-react';
import { ToolBookingDialog } from '@/components/booking/ToolBookingDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { ChatBot } from '@/components/ChatBot';

interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  price_per_day: number;
  price_per_month: number;
  price_per_season: number;
  availability: boolean;
  location: string | null;
}

const Tools: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch tools from Supabase
  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('availability', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tools:', error);
      return;
    }

    setTools(data || []);

    // Extract unique categories
    const uniqueCategories = Array.from(new Set(data?.map(tool => tool.category) || []));
    setCategories(uniqueCategories);

    // Calculate max price for slider
    const prices = data?.map(tool => tool.price_per_day) || [0];
    const max = Math.max(...prices, 4000);
    setMaxPrice(max);
    setPriceRange([0, max]);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, selectedCategory, searchTerm, priceRange]);

  const filterTools = () => {
    let filtered = tools;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(term) ||
        tool.description?.toLowerCase().includes(term)
      );
    }

    filtered = filtered.filter(tool =>
      tool.price_per_day >= priceRange[0] && tool.price_per_day <= priceRange[1]
    );

    setFilteredTools(filtered);
  };

  // Handle Rent/Booking button click
  const handleRentClick = (tool: Tool) => {
    if (!user) {
      toast({
        title: t('tools.loginRequiredTitle', { defaultValue: 'Login Required' }),
        description: t('tools.loginRequiredDesc', { defaultValue: 'Please log in to book a tool' }),
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    setSelectedTool(tool);
    setBookingDialogOpen(true);
  };

  // Helper to format currency
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <Layout>

      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

      {/* Floating AI button */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 flex items-center justify-center gap-3 rounded-full shadow-lg bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 z-50 px-7 py-7"
        >
          <Bot className="text-white" style={{ width: '30px', height: '30px' }} />
          <span className="text-white font-semibold text-2xl">{t('ai_button')}</span>
        </Button>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('tools.title', { defaultValue: 'Available Tools' })}</h1>
          <p className="text-xl text-muted-foreground">{t('tools.subtitle', { defaultValue: 'Find the right tool for your farming needs.' })}</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('tools.searchPlaceholder', { defaultValue: 'Search tools...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <label className="text-sm font-medium mb-2 block">{t('tools.category', { defaultValue: 'Category' })}</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tools.allCategories', { defaultValue: 'All Categories' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tools.allCategories', { defaultValue: 'All Categories' })}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                {t('tools.priceRange', { defaultValue: 'Price Range' })}: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])} {t('tools.perDay', { defaultValue: 'per day' })}
              </label>
              <Slider
                min={0}
                max={maxPrice}
                step={100}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map(tool => (
            <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <img
                  src={tool.image_url || '/placeholder.svg'}
                  alt={tool.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <Badge variant={tool.availability ? 'default' : 'secondary'}>
                    {tool.availability ? t('tools.availability', { defaultValue: 'Available' }) : t('tools.unavailable', { defaultValue: 'Unavailable' })}
                  </Badge>
                </div>
                <Badge variant="outline" className="mb-2">{tool.category}</Badge>
                <CardDescription className="line-clamp-2 mb-4">
                  {tool.description || t('tools.noDescription', { defaultValue: 'No description available' })}
                </CardDescription>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tools.daily', { defaultValue: 'Daily' })}:</span>
                    <span className="font-semibold">{formatCurrency(tool.price_per_day)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tools.monthly', { defaultValue: 'Monthly' })}:</span>
                    <span className="font-semibold">{formatCurrency(tool.price_per_month)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('tools.seasonal', { defaultValue: 'Seasonal' })}:</span>
                    <span className="font-semibold">{formatCurrency(tool.price_per_season)}</span>
                  </div>
                  {tool.location && (
                    <div className="text-xs text-muted-foreground mt-2">
                      📍 {tool.location}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  disabled={!tool.availability}
                  onClick={() => handleRentClick(tool)}
                >
                  {t('tools.rentNow', { defaultValue: 'Rent Now' })}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t('tools.noResults', { defaultValue: 'No tools found matching your criteria' })}
            </p>
          </div>
        )}
      </div>

      {/* Tool Booking Dialog */}
      {selectedTool && (
        <ToolBookingDialog
          tool={selectedTool}
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
        />
      )}

      <Footer />
    </Layout>
  );
};

export default Tools;
