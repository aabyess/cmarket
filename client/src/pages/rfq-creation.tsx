import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRfqSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const rfqFormSchema = insertRfqSchema.extend({
  deadline: z.string().min(1, 'Deadline is required'),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
});

type RfqFormData = z.infer<typeof rfqFormSchema>;

export default function RfqCreation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

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

  const form = useForm<RfqFormData>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      quantity: 1,
      unit: "",
      budgetMin: "",
      budgetMax: "",
      deliveryLocation: "",
      deadline: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      targetCountry: "",
      isUrgent: false,
    },
  });

  const createRfqMutation = useMutation({
    mutationFn: async (data: RfqFormData) => {
      const rfqData = {
        ...data,
        deadline: new Date(data.deadline + 'T23:59:59'), // Set to end of day
        budgetMin: data.budgetMin ? data.budgetMin : null,
        budgetMax: data.budgetMax ? data.budgetMax : null,
      };
      return await apiRequest("POST", "/api/rfqs", rfqData);
    },
    onSuccess: () => {
      toast({
        title: t('toast.rfqCreated'),
        description: t('toast.rfqCreatedDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rfqs/my"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t('toast.error'),
        description: t('toast.rfqCreateError'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RfqFormData) => {
    createRfqMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="flag-korea w-5 h-3 rounded-sm mr-2"></div>
                <i className="fas fa-handshake text-lg text-primary mx-2"></i>
                <div className="flag-egypt w-5 h-3 rounded-sm ml-2"></div>
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
      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t('rfq.create')}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {language === 'en' ? 'Request for quotations from Korean and Egyptian companies' : '한국 및 이집트 기업에서 견적을 요청하세요'}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder={language === 'en' ? 'Select category' : '카테고리 선택'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="industrial-equipment">{language === 'en' ? 'Industrial Equipment' : '산업 장비'}</SelectItem>
                            <SelectItem value="textiles-apparel">{language === 'en' ? 'Textiles & Apparel' : '섬유 및 의류'}</SelectItem>
                            <SelectItem value="construction-materials">{language === 'en' ? 'Construction Materials' : '건설 자재'}</SelectItem>
                            <SelectItem value="logistics-services">{language === 'en' ? 'Logistics Services' : '물류 서비스'}</SelectItem>
                            <SelectItem value="electronics">{t('category.electronics')}</SelectItem>
                            <SelectItem value="other">{t('category.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.targetCountry')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-target-country">
                              <SelectValue placeholder={language === 'en' ? 'Select target country' : '대상 국가 선택'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="egypt">🇪🇬 {t('country.egypt')}</SelectItem>
                            <SelectItem value="korea">🇰🇷 {t('country.korea')}</SelectItem>
                            <SelectItem value="both">{language === 'en' ? 'Both Countries' : '두 국가 모두'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.title')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={language === 'en' ? 'Enter product or service title' : '제품 또는 서비스 제목 입력'} 
                          {...field} 
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={language === 'en' ? 'Provide detailed specifications, requirements, and any special conditions...' : '상세 사양, 요구사항 및 특별 조건을 제공하세요...'}
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.quantity')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.unit')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unit">
                              <SelectValue placeholder={language === 'en' ? 'Select unit' : '단위 선택'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pieces">{t('unit.pieces')}</SelectItem>
                            <SelectItem value="tons">{t('unit.ton')}</SelectItem>
                            <SelectItem value="meters">{t('unit.meter')}</SelectItem>
                            <SelectItem value="hours">{language === 'en' ? 'Service Hours' : '서비스 시간'}</SelectItem>
                            <SelectItem value="containers">{t('unit.container')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>{language === 'en' ? 'Budget Range (USD)' : '예산 범위 (USD)'}</FormLabel>
                    <div className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name="budgetMin"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={language === 'en' ? 'Min' : '최소'}
                                {...field}
                                data-testid="input-budget-min"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budgetMax"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={language === 'en' ? 'Max' : '최대'}
                                {...field}
                                data-testid="input-budget-max"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.deliveryLocation')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={language === 'en' ? 'Seoul, Korea' : '서울, 대한민국'}
                            {...field}
                            data-testid="input-delivery-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.deadline')}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            data-testid="input-deadline"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isUrgent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-urgent"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('rfq.urgent')}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                  <Link href="/">
                    <Button type="button" variant="ghost" data-testid="button-cancel">
                      {t('form.cancel')}
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createRfqMutation.isPending}
                    data-testid="button-publish-rfq"
                  >
                    {createRfqMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        {language === 'en' ? 'Publishing...' : '게시 중...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        {t('rfq.publish')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
