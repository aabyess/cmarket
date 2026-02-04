import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuoteComparisonModal } from "@/components/modals/quote-comparison-modal";
import { ChatModal } from "@/components/modals/chat-modal";
import { Link, useParams } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Rfq, Quote } from "@shared/schema";

export default function RfqDetail() {
  const { id } = useParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Demo mode - no authentication needed

  const { data: rfq, isLoading: rfqLoading } = useQuery<Rfq>({
    queryKey: ["/api/rfqs", id],
    enabled: !!id,
    retry: false,
  });

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/rfqs", id, "quotes"],
    enabled: !!id,
    retry: false,
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "status-active text-white",
      pending: "status-pending text-white",
      completed: "status-completed text-white",
    };
    
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || "bg-gray-500 text-white"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: { en: string; ko: string; ms: string } } = {
      'industrial-equipment': { en: 'Industrial Equipment', ko: '산업 장비', ms: 'Peralatan Industri' },
      'textiles-apparel': { en: 'Textiles & Apparel', ko: '섬유 및 의류', ms: 'Tekstil & Pakaian' },
      'construction-materials': { en: 'Construction Materials', ko: '건설 자재', ms: 'Bahan Konstruksi' },
      'logistics-services': { en: 'Logistics Services', ko: '물류 서비스', ms: 'Layanan Logistik' },
      'electronics': { en: 'Electronics', ko: '전자제품', ms: 'Elektronik' },
      'other': { en: 'Other', ko: '기타', ms: 'Lainnya' }
    };
    return categories[category]?.[language] || category;
  };

  const getCountryName = (country: string) => {
    const countries: { [key: string]: { en: string; ko: string; ms: string } } = {
      'korea': { en: 'Korea', ko: '한국', ms: 'Korea' },
      'indonesia': { en: 'Indonesia', ko: '인도네시아', ms: 'Indonesia' },
      'both': { en: 'Korea & Indonesia', ko: '한국 & 인도네시아', ms: 'Korea & Indonesia' }
    };
    return countries[country]?.[language] || country;
  };

  if (isLoading || rfqLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="flag-korea w-5 h-3 rounded-sm mr-2"></div>
                  <i className="fas fa-handshake text-lg text-primary mx-2"></i>
                  <div className="flag-indonesia w-5 h-3 rounded-sm ml-2"></div>
                  <h1 className="ml-3 text-xl font-bold">CMARKET Trade</h1>
                </div>
              </Link>
              <Link href="/">
                <Button variant="ghost" data-testid="button-back-to-dashboard">
                  <i className="fas fa-arrow-left mr-2"></i>{t('nav.dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">RFQ Not Found</h2>
              <p className="text-muted-foreground">The requested RFQ could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="flag-korea w-5 h-3 rounded-sm mr-2"></div>
                <i className="fas fa-handshake text-lg text-primary mx-2"></i>
                <div className="flag-indonesia w-5 h-3 rounded-sm ml-2"></div>
                <h1 className="ml-3 text-xl font-bold">CMARKET Trade</h1>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="bg-muted p-1 rounded-lg flex">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-sm text-xs ${
                    language === 'en' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  data-testid="button-language-en"
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('ko')}
                  className={`px-2 py-1 rounded-sm text-xs ${
                    language === 'ko' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  data-testid="button-language-ko"
                >
                  한국어
                </button>
                <button 
                  onClick={() => setLanguage('ms')}
                  className={`px-2 py-1 rounded-sm text-xs ${
                    language === 'ms' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  data-testid="button-language-ms"
                >
                  Bahasa
                </button>
              </div>
              
              <Link href="/">
                <Button variant="ghost" data-testid="button-back-to-dashboard">
                  <i className="fas fa-arrow-left mr-2"></i>{t('nav.dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* RFQ Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{rfq.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{t('form.category')}: {getCategoryName(rfq.category)}</span>
                    <span>•</span>
                    <span>{t('form.targetCountry')}: {getCountryName(rfq.targetCountry)}</span>
                    <span>•</span>
                    <span>{t('form.deadline')}: {new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {rfq.isUrgent && (
                    <Badge variant="destructive">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      {t('rfq.urgent')}
                    </Badge>
                  )}
                  {getStatusBadge(rfq.status || 'active')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('form.description')}</h3>
                  <p className="text-muted-foreground">{rfq.description}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">{t('form.quantity')} & {t('form.unit')}</h4>
                    <p>{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                  </div>
                  {(rfq.budgetMin || rfq.budgetMax) && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">{language === 'en' ? 'Budget Range (USD)' : '예산 범위 (USD)'}</h4>
                      <p>
                        {rfq.budgetMin && `$${Number(rfq.budgetMin).toLocaleString()}`}
                        {rfq.budgetMin && rfq.budgetMax && ' - '}
                        {rfq.budgetMax && `$${Number(rfq.budgetMax).toLocaleString()}`}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">{t('form.deliveryLocation')}</h4>
                    <p>{rfq.deliveryLocation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participating Companies / Quotes */}
          {quotes.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {language === 'en' ? 'Participating Companies' : language === 'ko' ? '참여 업체' : 'Syarikat yang Mengambil Bahagian'} ({quotes.length})
                  </CardTitle>
                  <Button 
                    onClick={() => setShowQuoteModal(true)}
                    variant="outline"
                    size="sm"
                    data-testid="button-compare-quotes"
                  >
                    <i className="fas fa-chart-bar mr-2"></i>
                    {t('buttons.compareQuotes')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quotes.map((quote: any, index: number) => (
                    <div 
                      key={quote.id} 
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                      data-testid={`quote-card-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                              {quote.supplierName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="font-semibold text-base">{quote.supplierName}</p>
                              <p className="text-xs text-muted-foreground">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                {quote.supplierLocation}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 pl-13">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'en' ? 'Total Amount' : language === 'ko' ? '총 금액' : 'Jumlah Keseluruhan'}
                              </p>
                              <p className="font-semibold text-primary">${Number(quote.totalAmount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'en' ? 'Unit Price' : language === 'ko' ? '단가' : 'Harga Seunit'}
                              </p>
                              <p className="font-medium">${Number(quote.unitPrice).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {language === 'en' ? 'Delivery Time' : language === 'ko' ? '배송 기간' : 'Masa Penghantaran'}
                              </p>
                              <p className="font-medium">{quote.deliveryTime}</p>
                            </div>
                          </div>
                          {quote.notes && (
                            <p className="text-sm text-muted-foreground mt-2 pl-13">
                              <i className="fas fa-info-circle mr-1"></i>
                              {quote.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                            {quote.status}
                          </Badge>
                          <Button 
                            onClick={() => setShowChatModal(true)}
                            size="sm"
                            data-testid={`button-chat-${index}`}
                          >
                            <i className="fas fa-comments mr-2"></i>
                            {language === 'en' ? 'Chat' : language === 'ko' ? '채팅' : 'Sembang'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {language === 'en' ? 'No quotes received yet' : language === 'ko' ? '아직 받은 견적이 없습니다' : 'Tiada sebut harga diterima lagi'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <QuoteComparisonModal 
        rfqId={rfq.id}
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
      />
      
      <ChatModal 
        rfqId={rfq.id}
        open={showChatModal}
        onOpenChange={setShowChatModal}
      />
    </div>
  );
}