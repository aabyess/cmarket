import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeDisplay } from "@/components/ui/time-display";
import { QuoteComparisonModal } from "@/components/modals/quote-comparison-modal";
import { ChatModal } from "@/components/modals/chat-modal";
import { DeliveryConfirmationModal } from "@/components/modals/delivery-confirmation-modal";
import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Rfq, Order } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Demo mode - no authentication needed

  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery<Rfq[]>({
    queryKey: ["/api/rfqs/my"],
    enabled: true,
    retry: false,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: true,
    retry: false,
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "status-active text-white",
      pending: "status-pending text-white",
      completed: "status-completed text-white",
    };
    
    const statusLabels: Record<string, string> = {
      active: t('status.active'),
      pending: t('status.pending'),
      completed: t('status.completed'),
    };
    
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || "bg-gray-500 text-white"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Mock statistics data
  const mockStats = {
    totalRfqs: 15,
    activeRfqs: 12,
    completedOrders: 8,
    totalValue: 1250000,
    newQuotes: 24,
    pendingDeliveries: 3
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Country Flags Banner */}
      <div className="bg-gradient-to-r from-blue-400/70 via-slate-100 to-red-400/70 h-1.5"></div>
      <div className="bg-card border-b border-border py-2">
        <div className="container mx-auto px-4 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="flag-korea w-8 h-5 rounded-sm shadow-sm"></div>
            <span className="text-sm font-medium text-muted-foreground">{language === 'en' ? 'Republic of Korea' : language === 'ko' ? '대한민국' : 'Republik Korea'}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <i className="fas fa-exchange-alt"></i>
            <span className="text-xs">{language === 'en' ? 'Trade Partnership' : language === 'ko' ? '무역 파트너십' : 'Kemitraan Perdagangan'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flag-indonesia w-8 h-5 rounded-sm shadow-sm"></div>
            <span className="text-sm font-medium text-muted-foreground">{language === 'en' ? 'Republic of Indonesia' : language === 'ko' ? '인도네시아 공화국' : 'Republik Indonesia'}</span>
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flag-korea w-5 h-3 rounded-sm mr-2"></div>
                <i className="fas fa-handshake text-lg text-primary mx-2"></i>
                <div className="flag-indonesia w-5 h-3 rounded-sm ml-2"></div>
                <h1 className="ml-3 text-xl font-bold">CMARKET Trade</h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <Link href="/create-rfq">
                  <Button variant="ghost" size="sm" data-testid="nav-create-rfq">
                    {t('rfq.create')}
                  </Button>
                </Link>
                <Link href="/partners">
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-building mr-2"></i>
                    {language === 'ko' ? '파트너 찾기' : language === 'ms' ? 'Cari Mitra' : 'Find Partners'}
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-comments mr-2"></i>
                    {language === 'ko' ? '메시지' : language === 'ms' ? 'Pesan' : 'Messages'}
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <TimeDisplay />
              
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
              
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground" data-testid="button-notifications">
                <i className="fas fa-bell"></i>
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="notification-count">
                  {mockStats.pendingDeliveries}
                </span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium" data-testid="user-avatar">
                  {user.companyName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium" data-testid="company-name">{user.companyName}</div>
                  <div className="text-xs text-muted-foreground" data-testid="company-type">
                    {user.companyType === 'korean' ? t('auth.koreanCompany') : t('auth.indonesianCompany')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  {t('nav.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card-modern stats-card-blue hover-lift p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard.activeRfqs')}</p>
                <h3 className="text-3xl font-bold text-blue-600" data-testid="stat-active-rfqs">
                  {rfqs.filter(r => r.status === 'active').length || mockStats.activeRfqs}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 12%</span> {language === 'en' ? 'vs last month' : language === 'ko' ? '지난 달 대비' : 'vs bulan lalu'}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-file-alt text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="card-modern stats-card-orange hover-lift p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard.receivedQuotes')}</p>
                <h3 className="text-3xl font-bold text-orange-500" data-testid="stat-total-quotes">
                  {mockStats.newQuotes}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 8%</span> {language === 'en' ? 'vs last month' : language === 'ko' ? '지난 달 대비' : 'vs bulan lalu'}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-calculator text-orange-500 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="card-modern stats-card-green hover-lift p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard.completedDeals')}</p>
                <h3 className="text-3xl font-bold text-emerald-500" data-testid="stat-completed-deals">
                  {orders.length || mockStats.completedOrders}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 24%</span> {language === 'en' ? 'vs last month' : language === 'ko' ? '지난 달 대비' : 'vs bulan lalu'}
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-handshake text-emerald-500 text-2xl"></i>
              </div>
            </div>
          </div>

          <div className="card-modern stats-card-purple hover-lift p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('dashboard.totalValue')}</p>
                <h3 className="text-3xl font-bold text-purple-600" data-testid="stat-total-value">
                  ${mockStats.totalValue.toLocaleString()}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">↑ 18%</span> {language === 'en' ? 'vs last month' : language === 'ko' ? '지난 달 대비' : 'vs bulan lalu'}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-dollar-sign text-purple-600 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Recent RFQs Section */}
        <div className="card-modern rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{t('stats.recentRfqs')}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t('messages.manageRfqs')}</p>
              </div>
              <Link href="/create-rfq">
                <Button className="btn-modern text-white" data-testid="button-create-new-rfq">
                  <i className="fas fa-plus mr-2"></i>{t('rfq.create')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            {rfqsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer h-48 rounded-xl"></div>
                ))}
              </div>
            ) : rfqs.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-3xl text-muted-foreground"></i>
                </div>
                <p className="text-muted-foreground text-lg">{t('messages.noRfqsFound')}</p>
                <Link href="/create-rfq">
                  <Button className="mt-4 btn-modern text-white">
                    <i className="fas fa-plus mr-2"></i>{t('rfq.create')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rfqs.map((rfq) => (
                  <div 
                    key={rfq.id} 
                    className="card-modern hover-lift p-5 rounded-xl border border-border/50"
                    data-testid={`row-rfq-${rfq.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded" data-testid={`text-rfq-id-${rfq.id}`}>
                            {rfq.id.slice(0, 12)}
                          </span>
                          {getStatusBadge(rfq.status || 'pending')}
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-rfq-title-${rfq.id}`}>
                          {rfq.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-cube w-5"></i>
                        <span data-testid={`text-rfq-quantity-${rfq.id}`}>{rfq.quantity} {rfq.unit}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <i className="fas fa-calendar w-5"></i>
                        <span data-testid={`text-rfq-deadline-${rfq.id}`}>{new Date(rfq.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-comments w-5 text-muted-foreground"></i>
                        <Badge variant="secondary" className="text-xs" data-testid={`text-quotes-count-${rfq.id}`}>
                          {(rfq as any).quotes?.length || 0} {t('messages.quotesCount')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Link href={`/rfq/${rfq.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-detail-${rfq.id}`}>
                          <i className="fas fa-eye mr-2"></i>
                          {language === 'en' ? 'View' : language === 'ko' ? '상세보기' : 'Lihat'}
                        </Button>
                      </Link>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedRfqId(rfq.id);
                          setShowChatModal(true);
                        }}
                        data-testid={`button-chat-${rfq.id}`}
                      >
                        <i className="fas fa-comment mr-2"></i>
                        {t('buttons.chat')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedRfqId && (
        <>
          <QuoteComparisonModal
            rfqId={selectedRfqId}
            open={showQuoteModal}
            onOpenChange={setShowQuoteModal}
          />
          <ChatModal
            rfqId={selectedRfqId}
            open={showChatModal}
            onOpenChange={setShowChatModal}
          />
          <DeliveryConfirmationModal
            open={showConfirmationModal}
            onOpenChange={setShowConfirmationModal}
          />
        </>
      )}
    </div>
  );
}
