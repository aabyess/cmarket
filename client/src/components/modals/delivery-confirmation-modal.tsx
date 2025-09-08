import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DeliveryConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
}

export function DeliveryConfirmationModal({ open, onOpenChange, orderId }: DeliveryConfirmationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const confirmDeliveryMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      
      return await apiRequest("POST", `/api/orders/${orderId}/complete`, {
        rating: {
          rating,
          review: review.trim(),
          ratedId: "placeholder", // This would be the supplier ID
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Delivery Confirmed",
        description: "Payment has been released to the supplier. Thank you for your business!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOpenChange(false);
      setRating(5);
      setReview("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to confirm delivery. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleConfirmDelivery = () => {
    confirmDeliveryMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle>Delivery Confirmation</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-truck text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">Order Delivered Successfully!</h3>
            <p className="text-muted-foreground text-sm">
              Please confirm the delivery and release payment to the supplier
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium" data-testid="order-id">
                  {orderId?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supplier:</span>
                <span className="font-medium" data-testid="supplier-name">Cairo Steel Industries</span>
              </div>
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-medium" data-testid="product-name">Industrial Steel Pipes</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Label className="block text-sm font-medium mb-2">Rate this supplier</Label>
            <div className="flex items-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className={`text-xl ${
                    star <= rating ? 'text-secondary' : 'text-muted-foreground'
                  }`}
                  data-testid={`star-rating-${star}`}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
            </div>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full text-sm"
              rows={3}
              placeholder="Leave a review for future buyers..."
              data-testid="textarea-review"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-report-issue"
            >
              Report Issue
            </Button>
            <Button
              onClick={handleConfirmDelivery}
              disabled={confirmDeliveryMutation.isPending}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              data-testid="button-confirm-delivery"
            >
              {confirmDeliveryMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Confirming...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Confirm & Release Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
