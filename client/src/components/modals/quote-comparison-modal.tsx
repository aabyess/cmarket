import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuoteComparisonModalProps {
  rfqId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteComparisonModal({ rfqId, open, onOpenChange }: QuoteComparisonModalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  const { data: quotes = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/rfqs", rfqId, "quotes"],
    enabled: open && !!rfqId,
  });

  const { data: rfq } = useQuery<any>({
    queryKey: ["/api/rfqs", rfqId],
    enabled: open && !!rfqId,
  });

  const handleAcceptQuote = async (quoteId: string) => {
    setAcceptingQuoteId(quoteId);
    try {
      // This would trigger the payment flow
      toast({
        title: t('modal.quoteAccepted'),
        description: t('modal.redirectingPayment'),
      });
      // Navigate to checkout
      window.location.href = `/checkout/${quoteId}`;
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.quoteAcceptError'),
        variant: "destructive",
      });
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('modal.quoteComparison')} - {rfq?.title}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {rfq?.description} ({rfq?.quantity} {rfq?.unit})
          </p>
        </DialogHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('modal.noQuotes')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((quote: any, index: number) => (
                <Card key={quote.id} className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-6 h-4 rounded-sm mr-2 ${
                          quote.supplier?.companyType === 'egyptian' ? 'flag-egypt' : 'flag-korea'
                        }`}></div>
                        <div>
                          <h3 className="font-semibold" data-testid={`quote-supplier-${quote.id}`}>
                            {quote.supplier?.companyName || 'Unknown Supplier'}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <i className="fas fa-star text-secondary mr-1"></i>
                            <span>4.{5 + index} ({50 + index * 20} reviews)</span>
                          </div>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Unit Price:</span>
                        <span className="font-medium" data-testid={`quote-unit-price-${quote.id}`}>
                          ${Number(quote.unitPrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-lg" data-testid={`quote-total-${quote.id}`}>
                          ${Number(quote.totalAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Delivery:</span>
                        <span className="text-sm" data-testid={`quote-delivery-${quote.id}`}>
                          {quote.deliveryTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Terms:</span>
                        <span className="text-sm" data-testid={`quote-payment-terms-${quote.id}`}>
                          {quote.paymentTerms}
                        </span>
                      </div>
                      {quote.notes && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {quote.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAcceptQuote(quote.id)}
                        disabled={acceptingQuoteId === quote.id}
                        className="flex-1 bg-primary text-primary-foreground"
                        data-testid={`button-accept-quote-${quote.id}`}
                      >
                        {acceptingQuoteId === quote.id ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                            Accepting...
                          </>
                        ) : (
                          'Accept Quote'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3"
                        data-testid={`button-chat-quote-${quote.id}`}
                      >
                        <i className="fas fa-comments"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Compare quotes based on price, delivery time, and supplier ratings
              </div>
              <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="button-close-comparison">
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
