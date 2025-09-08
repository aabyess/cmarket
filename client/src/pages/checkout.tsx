import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ order }: { order: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?payment=success`,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your payment is being processed!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        data-testid="button-process-payment"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <i className="fas fa-lock mr-2"></i>
            Process Payment ($${(Number(order.totalAmount) + Number(order.platformFee)).toLocaleString()})
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { orderId } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: isAuthenticated && !!orderId,
    retry: false,
  });

  useEffect(() => {
    if (order && !clientSecret) {
      apiRequest("POST", "/api/create-payment-intent", { orderId: order.id })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          if (isUnauthorizedError(error)) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
            return;
          }
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [order, clientSecret, toast]);

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-secondary mr-2"></i>
                  Payment Service Unavailable
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Payment processing is currently unavailable. Please contact support to complete your order.
                </p>
                <Button onClick={() => window.history.back()} data-testid="button-go-back">
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center">
                <i className="fas fa-lock text-primary mr-2"></i>
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Order Summary */}
              <Card className="bg-muted mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm" data-testid="order-summary-item">
                      <span>Order Total</span>
                      <span>${Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm" data-testid="platform-fee">
                      <span>Platform Fee (2%)</span>
                      <span>${Number(order.platformFee).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-semibold" data-testid="total-amount">
                        <span>Total Amount</span>
                        <span>${(Number(order.totalAmount) + Number(order.platformFee)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Protection Notice */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Payment Protection</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Funds held in escrow until delivery confirmation</li>
                  <li>• Automatic release after purchase confirmation</li>
                  <li>• Full refund protection for non-delivery</li>
                </ul>
              </div>

              {/* Payment Form */}
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm order={order} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
