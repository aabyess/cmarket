import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatModalProps {
  rfqId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatModal({ rfqId, open, onOpenChange }: ChatModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/rfqs", rfqId, "messages"],
    enabled: open && !!rfqId,
  });

  const { data: rfq } = useQuery<any>({
    queryKey: ["/api/rfqs", rfqId],
    enabled: open && !!rfqId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/rfqs/${rfqId}/messages`, {
        content,
        receiverId: "placeholder", // This would be determined by the RFQ context
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/rfqs", rfqId, "messages"] });
    },
    onError: (error) => {
      toast({
        title: t('toast.error'),
        description: t('toast.messageError'),
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (open && !ws) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected");
        setWs(socket);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.data.rfqId === rfqId) {
          queryClient.invalidateQueries({ queryKey: ["/api/rfqs", rfqId, "messages"] });
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setWs(null);
      };

      return () => {
        socket.close();
      };
    }
  }, [open, ws, rfqId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center">
            <div className="flag-egypt w-5 h-3 rounded-sm mr-2"></div>
            <div>
              <h3 className="font-semibold">{t('modal.chat')} - {rfq?.title}</h3>
              <p className="text-xs text-muted-foreground">{language === 'en' ? 'RFQ Discussion' : '견적요청 논의'}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{language === 'en' ? 'No messages yet. Start the conversation!' : '아직 메시지가 없습니다. 대화를 시작해보세요!'}</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isOwnMessage = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {msg.sender?.companyName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        isOwnMessage
                          ? 'chat-bubble-sent ml-auto'
                          : 'chat-bubble-received'
                      }`}
                    >
                      <p className="text-sm" data-testid={`message-content-${msg.id}`}>{msg.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('modal.typeMessage')}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </Button>
          </form>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <i className="fas fa-paperclip mr-1"></i>
            <span>{language === 'en' ? 'Attach files' : '파일 첨부'}</span>
            <span className="mx-2">•</span>
            <i className="fas fa-smile mr-1"></i>
            <span>{language === 'en' ? 'Emoji' : '이모지'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
