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

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

  const { data: rfqs = [], isLoading: rfqsLoading } = useQuery({
    queryKey: ["/api/rfqs/my"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flag-korea w-5 h-3 rounded-sm mr-2"></div>
                <i className="fas fa-handshake text-lg text-primary mx-2"></i>
                <div className="flag-egypt w-5 h-3 rounded-sm ml-2"></div>
                <h1 className="ml-3 text-xl font-bold">KoEgy Connect</h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <Button variant="default" size="sm" data-testid="nav-dashboard">
                  {t('nav.dashboard')}
                </Button>
                <Link href="/create-rfq">
                  <Button variant="ghost" size="sm" data-testid="nav-create-rfq">
                    {t('rfq.create')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" data-testid="nav-my-rfqs">
                  {t('nav.myRfqs')}
                </Button>
                <Button variant="ghost" size="sm" data-testid="nav-messages">
                  {t('nav.messages')}
                </Button>
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
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground" data-testid="button-notifications">
                <i className="fas fa-bell"></i>
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="notification-count">
                  {orders.filter(o => o.status === 'delivered').length}
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
                    {user.companyType === 'korean' ? t('auth.koreanCompany') : t('auth.egyptianCompany')}
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
      <main className="container mx-auto px-4 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <i className="fas fa-file-alt text-primary text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold" data-testid="stat-active-rfqs">
                    {rfqs.filter(r => r.status === 'active').length}
                  </h3>
                  <p className="text-muted-foreground text-sm">{t('dashboard.activeRfqs')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <i className="fas fa-calculator text-secondary text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold" data-testid="stat-total-quotes">
                    {rfqs.reduce((acc, rfq) => acc + (rfq.quotes?.length || 0), 0)}
                  </h3>
                  <p className="text-muted-foreground text-sm">{t('dashboard.receivedQuotes')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <i className="fas fa-handshake text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold" data-testid="stat-completed-deals">
                    {orders.filter(o => o.status === 'completed').length}
                  </h3>
                  <p className="text-muted-foreground text-sm">{t('dashboard.completedDeals')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <i className="fas fa-dollar-sign text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold" data-testid="stat-total-value">
                    ${orders.filter(o => o.status === 'completed')
                      .reduce((acc, o) => acc + Number(o.totalAmount), 0)
                      .toLocaleString()}
                  </h3>
                  <p className="text-muted-foreground text-sm">{t('dashboard.totalValue')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent RFQs Table */}
        <Card className="shadow-sm">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t('stats.recentRfqs')}</h2>
                <p className="text-muted-foreground text-sm">{t('messages.manageRfqs')}</p>
              </div>
              <Link href="/create-rfq">
                <Button data-testid="button-create-new-rfq">
                  <i className="fas fa-plus mr-2"></i>{t('rfq.create')}
                </Button>
              </Link>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            {rfqsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : rfqs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">{t('messages.noRfqsFound')}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.rfqId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.productService')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.deadline')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.quotes')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-accent transition-colors" data-testid={`row-rfq-${rfq.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary" data-testid={`text-rfq-id-${rfq.id}`}>
                        {rfq.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" data-testid={`text-rfq-title-${rfq.id}`}>
                        {rfq.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" data-testid={`text-rfq-quantity-${rfq.id}`}>
                        {rfq.quantity} {rfq.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground" data-testid={`text-rfq-deadline-${rfq.id}`}>
                        {new Date(rfq.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-testid={`status-rfq-${rfq.id}`}>
                        {getStatusBadge(rfq.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" data-testid={`text-quotes-count-${rfq.id}`}>
                        <Badge variant="secondary">
                          {rfq.quotes?.length || 0} {t('messages.quotesCount')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Link href={`/rfq/${rfq.id}`}>
                          <Button
                            variant="link"
                            size="sm"
                            data-testid={`button-view-detail-${rfq.id}`}
                          >
                            {language === 'en' ? 'View Detail' : '견적 보기'}
                          </Button>
                        </Link>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedRfqId(rfq.id);
                            setShowQuoteModal(true);
                          }}
                          data-testid={`button-view-quotes-${rfq.id}`}
                        >
                          {t('buttons.viewQuotes')}
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedRfqId(rfq.id);
                            setShowChatModal(true);
                          }}
                          data-testid={`button-chat-${rfq.id}`}
                        >
                          {t('buttons.chat')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
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
