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

export default function RfqDetail() {
  const { id } = useParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('toast.unauthorized'),
        description: t('toast.unauthorizedDesc'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: rfq, isLoading: rfqLoading } = useQuery({
    queryKey: ["/api/rfqs", id],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["/api/rfqs", id, "quotes"],
    enabled: isAuthenticated && !!id,
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
    const categories: { [key: string]: { en: string; ko: string } } = {
      'industrial-equipment': { en: 'Industrial Equipment', ko: '산업 장비' },
      'textiles-apparel': { en: 'Textiles & Apparel', ko: '섬유 및 의류' },
      'construction-materials': { en: 'Construction Materials', ko: '건설 자재' },
      'logistics-services': { en: 'Logistics Services', ko: '물류 서비스' },
      'electronics': { en: 'Electronics', ko: '전자제품' },
      'other': { en: 'Other', ko: '기타' }
    };
    return categories[category]?.[language] || category;
  };

  const getCountryName = (country: string) => {
    const countries: { [key: string]: { en: string; ko: string } } = {
      'korea': { en: 'Korea', ko: '한국' },
      'egypt': { en: 'Egypt', ko: '이집트' },
      'both': { en: 'Korea & Egypt', ko: '한국 & 이집트' }
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
                  <div className="flag-egypt w-5 h-3 rounded-sm ml-2"></div>
                  <h1 className="ml-3 text-xl font-bold">KoEgy Connect</h1>
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
                <div className="flag-egypt w-5 h-3 rounded-sm ml-2"></div>
                <h1 className="ml-3 text-xl font-bold">KoEgy Connect</h1>
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

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => setShowChatModal(true)}
                  data-testid="button-open-chat"
                >
                  <i className="fas fa-comments mr-2"></i>
                  {t('buttons.chat')}
                </Button>
                
                {quotes.length > 0 && (
                  <Button 
                    onClick={() => setShowQuoteModal(true)}
                    variant="outline"
                    data-testid="button-compare-quotes"
                  >
                    <i className="fas fa-chart-bar mr-2"></i>
                    {t('buttons.compareQuotes')} ({quotes.length})
                  </Button>
                )}
                
                <div className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? `Posted ${new Date(rfq.createdAt).toLocaleDateString()}`
                    : `${new Date(rfq.createdAt).toLocaleDateString()} 게시됨`
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotes Section */}
          {quotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('quotes.received')} ({quotes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotes.slice(0, 3).map((quote: any) => (
                    <div key={quote.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">${Number(quote.totalAmount).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Unit price' : '단가'}: ${Number(quote.unitPrice).toLocaleString()} / {rfq.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' ? 'Delivery' : '배송'}: {quote.deliveryTime}
                          </p>
                        </div>
                        <Badge variant={quote.status === 'pending' ? 'secondary' : 'default'}>
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {quotes.length > 3 && (
                    <Button variant="outline" onClick={() => setShowQuoteModal(true)}>
                      {language === 'en' 
                        ? `View all ${quotes.length} quotes` 
                        : `모든 견적 ${quotes.length}개 보기`
                      }
                    </Button>
                  )}
                </div>
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