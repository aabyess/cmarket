import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRfqSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Package, DollarSign, Truck, CheckCircle2 } from "lucide-react";

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
      deadline: new Date().toISOString().split('T')[0],
      targetCountry: "",
      isUrgent: false,
    },
  });

  const createRfqMutation = useMutation({
    mutationFn: async (data: RfqFormData) => {
      const rfqData = {
        ...data,
        deadline: new Date(data.deadline + 'T23:59:59'),
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getTextByLanguage = (en: string, ko: string, ms: string) => {
    return language === 'en' ? en : language === 'ko' ? ko : ms;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="flag-korea w-5 h-3 rounded-sm mr-2"></div>
                <i className="fas fa-handshake text-lg text-primary mx-2"></i>
                <div className="flag-indonesia w-5 h-3 rounded-sm ml-2"></div>
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
              
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-to-dashboard">
                  <i className="fas fa-arrow-left mr-2"></i>{t('nav.dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {getTextByLanguage(
                'Create New Request for Quotation',
                '새로운 견적 요청 만들기',
                'Buat Permintaan Penawaran Harga Baru'
              )}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {getTextByLanguage(
                'Fill in the details below to receive competitive quotes from verified Korean and Indonesian suppliers',
                '한국 및 인도네시아 검증된 공급업체로부터 경쟁력 있는 견적을 받으려면 아래 세부 정보를 작성하세요',
                'Isi detail berikut untuk menerima penawaran kompetitif dari pemasok Korea dan Indonesia yang terverifikasi'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Section 1: Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        1
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          {getTextByLanguage('Basic Information', '기본 정보', 'Informasi Dasar')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {getTextByLanguage(
                            'Category and target market for your request',
                            '요청의 카테고리 및 타겟 시장',
                            'Kategori serta target pasar untuk permintaan Anda'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">{t('form.category')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category" className="h-11">
                                  <SelectValue placeholder={getTextByLanguage('Select category', '카테고리 선택', 'Pilih kategori')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="industrial-equipment">{getTextByLanguage('Industrial Equipment', '산업 장비', 'Peralatan Perindustrian')}</SelectItem>
                                <SelectItem value="textiles-apparel">{getTextByLanguage('Textiles & Apparel', '섬유 및 의류', 'Tekstil & Pakaian')}</SelectItem>
                                <SelectItem value="construction-materials">{getTextByLanguage('Construction Materials', '건설 자재', 'Material Konstruksi')}</SelectItem>
                                <SelectItem value="electronics">{getTextByLanguage('Electronics & IT', '전자 및 IT', 'Elektronik & IT')}</SelectItem>
                                <SelectItem value="food-beverages">{getTextByLanguage('Food & Beverages', '식품 및 음료', 'Makanan & Minuman')}</SelectItem>
                                <SelectItem value="automotive-parts">{getTextByLanguage('Automotive Parts', '자동차 부품', 'Suku Cadang Otomotif')}</SelectItem>
                                <SelectItem value="chemicals-raw-materials">{getTextByLanguage('Chemicals & Raw Materials', '화학 및 원자재', 'Bahan Kimia & Bahan Baku')}</SelectItem>
                                <SelectItem value="machinery-equipment">{getTextByLanguage('Machinery & Equipment', '기계 및 장비', 'Mesin & Peralatan')}</SelectItem>
                                <SelectItem value="agricultural-products">{getTextByLanguage('Agricultural Products', '농산물', 'Produk Pertanian')}</SelectItem>
                                <SelectItem value="packaging-materials">{getTextByLanguage('Packaging Materials', '포장재', 'Bahan Kemasan')}</SelectItem>
                                <SelectItem value="medical-supplies">{getTextByLanguage('Medical Supplies', '의료용품', 'Obat-obatan')}</SelectItem>
                                <SelectItem value="furniture-home-decor">{getTextByLanguage('Furniture & Home Decor', '가구 및 홈데코', 'Perabot & Hiasan Rumah')}</SelectItem>
                                <SelectItem value="beauty-cosmetics">{getTextByLanguage('Beauty & Cosmetics', '미용 및 화장품', 'Kecantikan & Kosmetik')}</SelectItem>
                                <SelectItem value="toys-games">{getTextByLanguage('Toys & Games', '완구 및 게임', 'Mainan & Permainan')}</SelectItem>
                                <SelectItem value="sporting-goods">{getTextByLanguage('Sporting Goods', '스포츠용품', 'Peralatan Olahraga')}</SelectItem>
                                <SelectItem value="office-supplies">{getTextByLanguage('Office Supplies', '사무용품', 'Perlengkapan Kantor')}</SelectItem>
                                <SelectItem value="safety-equipment">{getTextByLanguage('Safety Equipment', '안전장비', 'Peralatan Keselamatan')}</SelectItem>
                                <SelectItem value="energy-power">{getTextByLanguage('Energy & Power', '에너지 및 전력', 'Energi & Tenaga Listrik')}</SelectItem>
                                <SelectItem value="logistics-services">{getTextByLanguage('Logistics Services', '물류 서비스', 'Logistik')}</SelectItem>
                                <SelectItem value="other">{getTextByLanguage('Other', '기타', 'Lain-lain')}</SelectItem>
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
                            <FormLabel className="text-sm font-medium">{t('form.targetCountry')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-target-country" className="h-11">
                                  <SelectValue placeholder={getTextByLanguage('Select target country', '대상 국가 선택', 'Pilih negara sasaran')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="indonesia">🇮🇩 {t('country.indonesia')}</SelectItem>
                                <SelectItem value="korea">🇰🇷 {t('country.korea')}</SelectItem>
                                <SelectItem value="both">{getTextByLanguage('Both Countries', '두 국가 모두', 'Kedua-dua Negara')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Product Details */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        2
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <Package className="w-5 h-5 mr-2" />
                          {getTextByLanguage('Product Details', '제품 세부정보', 'Detail Produk')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {getTextByLanguage(
                            'Describe what you need in detail',
                            '필요한 항목을 자세히 설명하세요',
                            'Terangkan apa yang anda perlukan dengan terperinci'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6 pl-11">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">{t('form.title')}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={getTextByLanguage(
                                  'e.g., Industrial CNC Machine',
                                  '예: 산업용 CNC 기계',
                                  'cth: Mesin CNC Perindustrian'
                                )} 
                                {...field} 
                                data-testid="input-title"
                                className="h-11"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {getTextByLanguage(
                                'A clear, concise title for your product or service request',
                                '제품 또는 서비스 요청에 대한 명확하고 간결한 제목',
                                'Judul yang jelas dan ringkas untuk permintaan produk atau layanan anda'
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">{t('form.description')}</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={5}
                                placeholder={getTextByLanguage(
                                  'Include specifications, dimensions, materials, quality requirements, certifications needed, etc.',
                                  '사양, 치수, 재료, 품질 요구사항, 필요한 인증 등을 포함하세요',
                                  'Sertakan spesifikasi, dimensi, bahan, persyaratan kualitas, sertifikasi yang diperlukan, dll.'
                                )}
                                {...field}
                                data-testid="textarea-description"
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {getTextByLanguage(
                                'The more detail you provide, the more accurate quotes you will receive',
                                '더 자세한 정보를 제공할수록 더 정확한 견적을 받으실 수 있습니다',
                                'Semakin lengkap rincian yang anda berikan, semakin tepat penawaran harga yang anda terima'
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">{t('form.quantity')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-quantity"
                                  className="h-11"
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
                              <FormLabel className="text-sm font-medium">{t('form.unit')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-unit" className="h-11">
                                    <SelectValue placeholder={getTextByLanguage('Select unit', '단위 선택', 'Pilih unit')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pieces">{t('unit.pieces')}</SelectItem>
                                  <SelectItem value="tons">{t('unit.ton')}</SelectItem>
                                  <SelectItem value="meters">{t('unit.meter')}</SelectItem>
                                  <SelectItem value="hours">{getTextByLanguage('Service Hours', '서비스 시간', 'Jam Perkhidmatan')}</SelectItem>
                                  <SelectItem value="containers">{t('unit.container')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 3: Budget & Logistics */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        3
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <DollarSign className="w-5 h-5 mr-2" />
                          {getTextByLanguage('Budget & Logistics', '예산 및 물류', 'Anggaran Biaya & Logistik')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {getTextByLanguage(
                            'Budget expectations and delivery requirements',
                            '예산 기대치 및 배송 요구사항',
                            'Ekspektasi anggaran biaya dan pengiriman'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6 pl-11">
                      <div>
                        <FormLabel className="text-sm font-medium mb-3 block">
                          {getTextByLanguage('Budget Range (USD)', '예산 범위 (USD)', 'Kisaran Anggaran (USD)')}
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="budgetMin"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder={getTextByLanguage('Min', '최소', 'Min')}
                                    {...field}
                                    data-testid="input-budget-min"
                                    className="h-11"
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
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder={getTextByLanguage('Max', '최대', 'Maks')}
                                    {...field}
                                    data-testid="input-budget-max"
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {getTextByLanguage(
                            'Optional: Providing a budget range helps suppliers submit relevant quotes',
                            '선택사항: 예산 범위를 제공하면 공급업체가 관련 견적을 제출하는 데 도움이 됩니다',
                            'Opsional: Memberikan kisaran anggaran membantu pemasok mengajukan penawaran yang relevan'
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="deliveryLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium flex items-center">
                                <Truck className="w-4 h-4 mr-1.5" />
                                {t('form.deliveryLocation')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={getTextByLanguage('Seoul, Korea', '서울, 대한민국', 'Jakarta, Indonesia')}
                                  {...field}
                                  data-testid="input-delivery-location"
                                  className="h-11"
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
                              <FormLabel className="text-sm font-medium">{t('form.deadline')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  data-testid="input-deadline"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                {getTextByLanguage(
                                  'Last date to receive quotes',
                                  '견적 접수 마감일',
                                  'Tarikh akhir menerima sebut harga'
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 4: Final Options */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        4
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          {getTextByLanguage('Additional Options', '추가 옵션', 'Pilihan Tambahan')}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {getTextByLanguage(
                            'Mark special requirements for your request',
                            '요청에 대한 특별 요구사항 표시',
                            'Tandakan keperluan khas untuk permintaan anda'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="pl-11">
                      <FormField
                        control={form.control}
                        name="isUrgent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-muted/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-urgent"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                {t('rfq.urgent')}
                              </FormLabel>
                              <FormDescription className="text-xs">
                                {getTextByLanguage(
                                  'Urgent requests are prioritized and highlighted to suppliers',
                                  '긴급 요청은 우선순위가 지정되고 공급업체에 강조 표시됩니다',
                                  'Permintaan mendesak diberi keutamaan dan ditonjolkan kepada pembekal'
                                )}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                    <Link href="/">
                      <Button type="button" variant="outline" className="w-full sm:w-auto" data-testid="button-cancel">
                        {t('form.cancel')}
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={createRfqMutation.isPending}
                      className="w-full sm:w-auto min-w-[180px]"
                      data-testid="button-publish-rfq"
                    >
                      {createRfqMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                          {getTextByLanguage('Publishing...', '게시 중...', 'Menerbitkan...')}
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
        </div>
      </main>
    </div>
  );
}
