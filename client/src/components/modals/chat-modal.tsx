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
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [translatedMessages, setTranslatedMessages] = useState<{[key: string]: {text: string, lang: 'ko' | 'en' | 'ms'}}>({});

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

  // Simple translation function for demo purposes - tri-lingual support
  const translateMessage = (text: string, toLanguage: 'ko' | 'en' | 'ms') => {
    const translations: {[key: string]: {ko: string, en: string, ms: string}} = {
      "Hello! I'm interested in your Industrial Manufacturing Equipment RFQ. Could you provide more details about the specifications?": {
        ko: "안녕하세요! 귀하의 산업용 제조 장비 견적 요청에 관심이 있습니다. 사양에 대한 자세한 정보를 제공해 주실 수 있나요?",
        en: "Hello! I'm interested in your Industrial Manufacturing Equipment RFQ. Could you provide more details about the specifications?",
        ms: "Halo! Saya berminat dengan RFQ Peralatan Pembuatan Perindustrian anda. Bolehkah anda memberikan maklumat lanjut mengenai spesifikasinya?"
      },
      "Hi! Thanks for your interest. We need equipment for textile manufacturing with specific quality certifications. Are you able to provide ISO certifications?": {
        ko: "안녕하세요! 관심을 가져주셔서 감사합니다. 특정 품질 인증을 받은 섬유 제조용 장비가 필요합니다. ISO 인증을 제공할 수 있나요?",
        en: "Hi! Thanks for your interest. We need equipment for textile manufacturing with specific quality certifications. Are you able to provide ISO certifications?",
        ms: "Hai! Terima kasih atas minat anda. Kami memerlukan peralatan untuk pembuatan tekstil dengan pensijilan kualiti tertentu. Adakah anda dapat menyediakan pensijilan ISO?"
      },
      "Yes, we can provide ISO 9001 and ISO 14001 certifications. Our equipment is manufactured in Korea with the highest quality standards.": {
        ko: "네, ISO 9001 및 ISO 14001 인증을 제공할 수 있습니다. 저희 장비는 최고 품질 기준으로 한국에서 제조됩니다.",
        en: "Yes, we can provide ISO 9001 and ISO 14001 certifications. Our equipment is manufactured in Korea with the highest quality standards.",
        ms: "Ya, kami boleh menyediakan pensijilan ISO 9001 dan ISO 14001. Peralatan kami dikilangkan di Korea dengan piawaian kualiti tertinggi."
      },
      "Perfect! What's your estimated delivery time to Jakarta, Indonesia?": {
        ko: "완벽합니다! 인도네시아 자카르타까지의 예상 배송 시간은 어떻게 되나요?",
        en: "Perfect! What's your estimated delivery time to Jakarta, Indonesia?",
        ms: "Sempurna! Berapa anggaran masa penghantaran ke Jakarta, Indonesia?"
      },
      "Delivery to Jakarta typically takes 4-6 weeks including customs clearance. We handle all shipping documentation.": {
        ko: "자카르타까지의 배송은 통관을 포함하여 일반적으로 4-6주가 소요됩니다. 모든 배송 서류를 저희가 처리합니다.",
        en: "Delivery to Jakarta typically takes 4-6 weeks including customs clearance. We handle all shipping documentation.",
        ms: "Penghantaran ke Jakarta biasanya mengambil masa 4-6 minggu termasuk pelepasan kastam. Kami mengendalikan semua dokumentasi penghantaran."
      }
    };

    const langLabels = { ko: '한국어', en: 'English', ms: 'Bahasa' };
    return translations[text]?.[toLanguage] || `[${langLabels[toLanguage]}로 번역됨] ${text}`;
  };

  const handleTranslate = (messageId: string, content: string, targetLang: 'ko' | 'en' | 'ms') => {
    const translated = translateMessage(content, targetLang);
    setTranslatedMessages(prev => ({
      ...prev,
      [messageId]: { text: translated, lang: targetLang }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center">
            <div className="flag-indonesia w-5 h-3 rounded-sm mr-2"></div>
            <div>
              <h3 className="font-semibold">{t('modal.chat')} - {rfq?.title}</h3>
              <p className="text-xs text-muted-foreground">{language === 'en' ? 'RFQ Discussion' : language === 'ko' ? '견적요청 논의' : 'Perbincangan RFQ'}</p>
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
              <p className="text-muted-foreground">{language === 'en' ? 'No messages yet. Start the conversation!' : language === 'ko' ? '아직 메시지가 없습니다. 대화를 시작해보세요!' : 'Belum ada mesej lagi. Mulakan perbualan!'}</p>
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
                      <p className="text-sm" data-testid={`message-content-${msg.id}`}>
                        {translatedMessages[msg.id]?.text || msg.content}
                      </p>
                      {translatedMessages[msg.id] && (
                        <p className="text-xs opacity-70 mt-1 italic">
                          {translatedMessages[msg.id].lang === 'ko' ? '한국어로 번역됨' : translatedMessages[msg.id].lang === 'en' ? 'Translated to English' : 'Diterjemahkan ke Bahasa'}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(msg.createdAt)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslate(msg.id, msg.content, 'ko')}
                        className="h-6 px-1.5 text-xs"
                        data-testid={`button-translate-ko-${msg.id}`}
                      >
                        <i className="fas fa-language mr-0.5 text-[10px]"></i>
                        한국어
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslate(msg.id, msg.content, 'en')}
                        className="h-6 px-1.5 text-xs"
                        data-testid={`button-translate-en-${msg.id}`}
                      >
                        <i className="fas fa-language mr-0.5 text-[10px]"></i>
                        EN
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslate(msg.id, msg.content, 'ms')}
                        className="h-6 px-1.5 text-xs"
                        data-testid={`button-translate-ms-${msg.id}`}
                      >
                        <i className="fas fa-language mr-0.5 text-[10px]"></i>
                        Bahasa
                      </Button>
                    </div>
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
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                  {t('payment.processing')}
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  {t('buttons.send')}
                </>
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
