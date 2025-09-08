import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCompanyType, setSelectedCompanyType] = useState<'korean' | 'egyptian' | null>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = () => {
    if (!selectedCompanyType) {
      toast({
        title: "Company Type Required",
        description: "Please select your company type before signing in.",
        variant: "destructive",
      });
      return;
    }
    
    // Store company type for post-login setup
    localStorage.setItem('selectedCompanyType', selectedCompanyType);
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="p-8">
          {/* Platform Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="flag-korea w-6 h-4 rounded-sm mr-2"></div>
              <i className="fas fa-handshake text-2xl text-primary mx-2"></i>
              <div className="flag-egypt w-6 h-4 rounded-sm ml-2"></div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">CMARKET Trade</h1>
            <p className="text-muted-foreground text-sm">
              {t('platform.title')}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted p-1 rounded-lg flex">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent'
                }`}
                data-testid="button-language-en"
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1 rounded-md text-sm ${
                  language === 'ko' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent'
                }`}
                data-testid="button-language-ko"
              >
                한국어
              </button>
            </div>
          </div>

          {/* Company Type Selection */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-medium text-foreground">
              {t('auth.selectCompanyType')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedCompanyType('korean')}
                className={`border-2 p-4 rounded-lg text-center hover-lift transition-all ${
                  selectedCompanyType === 'korean'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-secondary'
                }`}
                data-testid="button-company-korean"
              >
                <div className="flag-korea w-8 h-5 rounded-sm mx-auto mb-2"></div>
                <div className="text-sm font-medium">
                  {t('auth.koreanCompany')}
                </div>
                <div className="text-xs opacity-90">
                  {language === 'en' ? '한국 기업' : 'Korean Company'}
                </div>
              </button>
              <button
                onClick={() => setSelectedCompanyType('egyptian')}
                className={`border-2 p-4 rounded-lg text-center hover-lift transition-all ${
                  selectedCompanyType === 'egyptian'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-secondary'
                }`}
                data-testid="button-company-egyptian"
              >
                <div className="flag-egypt w-8 h-5 rounded-sm mx-auto mb-2"></div>
                <div className="text-sm font-medium">
                  {t('auth.egyptianCompany')}
                </div>
                <div className="text-xs opacity-90">شركة مصرية</div>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="button-sign-in"
          >
            {t('auth.signIn')}
          </Button>

          <div className="text-center mt-4">
            <a href="#" className="text-primary text-sm hover:underline" data-testid="link-create-account">
              {t('auth.createAccount')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
