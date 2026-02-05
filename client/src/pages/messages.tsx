import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, Paperclip, Image, ArrowLeft } from "lucide-react";

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: string;
  otherUser: {
    id: string;
    companyName: string;
    companyType: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function Messages() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['/api/conversations', selectedConversation?.id, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`);
      return res.json();
    },
    enabled: !!selectedConversation,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) return;
      return apiRequest('POST', `/api/conversations/${selectedConversation.id}/messages`, {
        receiverId: selectedConversation.otherUser.id,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          refetchMessages();
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return language === 'ko' ? '어제' : 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

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
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'ko' ? '돌아가기' : 'Back'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-80 border-r border-gray-200 dark:border-slate-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {language === 'ko' ? '메시지' : 'Messages'}
                </h2>
              </div>
              
              <ScrollArea className="flex-1">
                {conversationsLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>{language === 'ko' ? '대화가 없습니다' : 'No conversations yet'}</p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700 ${
                          selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-slate-700' : ''
                        }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className={`w-12 h-12 ${getInitialColor(conv.otherUser.companyType)} rounded-full flex items-center justify-center text-white font-bold`}>
                              {getInitial(conv.otherUser.companyName)}
                            </div>
                            {conv.unreadCount > 0 && (
                              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {conv.otherUser.companyName}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate">
                                {conv.lastMessage?.content || (language === 'ko' ? '새 대화' : 'New conversation')}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                    <div className={`w-10 h-10 ${getInitialColor(selectedConversation.otherUser.companyType)} rounded-full flex items-center justify-center text-white font-bold`}>
                      {getInitial(selectedConversation.otherUser.companyName)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {selectedConversation.otherUser.companyName}
                      </h3>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{language === 'ko' ? '메시지가 없습니다. 첫 메시지를 보내보세요!' : 'No messages yet. Send the first message!'}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isOwn = msg.senderId === user?.id;
                          return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                {!isOwn && (
                                  <div className={`w-8 h-8 ${getInitialColor(selectedConversation.otherUser.companyType)} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                    {getInitial(selectedConversation.otherUser.companyName)}
                                  </div>
                                )}
                                <div>
                                  <div className={`px-4 py-2 rounded-2xl ${
                                    isOwn 
                                      ? 'bg-blue-500 text-white rounded-br-md' 
                                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-md'
                                  }`}>
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                                    {formatTime(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <button type="button" className="text-gray-400 hover:text-gray-600">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button type="button" className="text-gray-400 hover:text-gray-600">
                        <Image className="w-5 h-5" />
                      </button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={language === 'ko' ? '메시지를 입력하세요...' : 'Type a message...'}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={!newMessage.trim() || sendMessage.isPending}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p>{language === 'ko' ? '대화를 선택하세요' : 'Select a conversation'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
