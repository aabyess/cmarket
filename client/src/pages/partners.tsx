import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Filter, Star, MessageSquare, CheckCircle, MapPin } from "lucide-react";

interface Company {
  id: string;
  companyName: string;
  companyType: string;
  companyCategory: string | null;
  companyLocation: string | null;
  companyDescription: string | null;
  companyTags: string[] | null;
  isVerified: boolean;
  avgRating: number;
  ratingCount: number;
}

export default function Partners() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies', searchQuery, countryFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (countryFilter !== 'all') params.append('country', countryFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      const res = await fetch(`/api/companies?${params}`);
      return res.json();
    },
  });

  const startConversation = useMutation({
    mutationFn: async (participantId: string) => {
      return apiRequest('POST', '/api/conversations', { participantId });
    },
    onSuccess: () => {
      setLocation('/messages');
    },
  });

  const categories = [
    { value: 'all', label: language === 'ko' ? '전체 카테고리' : 'All Categories' },
    { value: 'manufacturing', label: language === 'ko' ? '제조사' : 'Manufacturing' },
    { value: 'services', label: language === 'ko' ? '서비스' : 'Services' },
    { value: 'logistics', label: language === 'ko' ? '물류' : 'Logistics' },
    { value: 'textiles', label: language === 'ko' ? '섬유/의류' : 'Textiles' },
    { value: 'chemicals', label: language === 'ko' ? '화학' : 'Chemicals' },
    { value: 'handicrafts', label: language === 'ko' ? '공예품' : 'Handicrafts' },
  ];

  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const getInitialColor = (type: string) => {
    return type === 'korean' ? 'bg-blue-500' : 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="bg-gradient-to-r from-blue-600 via-white to-red-600 h-1"></div>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="flex items-center space-x-1">
                <div className="flag-korea w-6 h-4 rounded-sm shadow-sm"></div>
                <i className="fas fa-handshake text-primary text-sm"></i>
                <div className="flag-indonesia w-6 h-4 rounded-sm shadow-sm"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                CMARKET Trade
              </span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-muted p-1 rounded-lg flex">
              <button 
                className={`px-2 py-1 rounded-sm text-xs ${language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                onClick={() => setLanguage('en')}
              >EN</button>
              <button 
                className={`px-2 py-1 rounded-sm text-xs ${language === 'ko' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                onClick={() => setLanguage('ko')}
              >한국어</button>
              <button 
                className={`px-2 py-1 rounded-sm text-xs ${language === 'ms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                onClick={() => setLanguage('ms')}
              >Bahasa</button>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <i className="fas fa-arrow-left mr-2"></i>
                {language === 'ko' ? '돌아가기' : 'Back'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ko' ? '파트너 찾기' : 'Find Partners'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ko' 
              ? '검증된 한국 및 인도네시아 기업 파트너를 검색하고 연결하세요.' 
              : 'Search and connect with verified Korean and Indonesian business partners.'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={language === 'ko' ? '기업명, 서비스, 태그 검색...' : 'Search company name, services, tags...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={language === 'ko' ? '전체 국가' : 'All Countries'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ko' ? '전체 국가' : 'All Countries'}</SelectItem>
                <SelectItem value="korean">{language === 'ko' ? '한국' : 'Korea'}</SelectItem>
                <SelectItem value="indonesian">{language === 'ko' ? '인도네시아' : 'Indonesia'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={language === 'ko' ? '전체 카테고리' : 'All Categories'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Company Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ko' ? '등록된 기업이 없습니다' : 'No companies found'}
            </h3>
            <p className="text-gray-500">
              {language === 'ko' ? '검색 조건을 변경해보세요' : 'Try changing your search criteria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${getInitialColor(company.companyType)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {getInitial(company.companyName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {company.companyName}
                        </h3>
                        {company.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {company.companyLocation && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{company.companyLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {company.companyCategory && (
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.value === company.companyCategory)?.label || company.companyCategory}
                      </Badge>
                    )}
                    {company.companyTags?.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {company.companyDescription || (language === 'ko' ? '기업 설명이 없습니다.' : 'No description available.')}
                  </p>

                  {/* Rating and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {company.avgRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">({company.ratingCount})</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startConversation.mutate(company.id)}
                      disabled={startConversation.isPending || company.id === user?.id}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {language === 'ko' ? '문의하기' : 'Inquire'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
