import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, register, isLoginPending, isRegisterPending } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<"korean" | "indonesian">("korean");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login({ email, password });
        toast({ title: "로그인 성공", description: "환영합니다!" });
      } else {
        await register({ 
          email, 
          password, 
          companyName, 
          companyType,
          firstName,
          lastName 
        });
        toast({ title: "회원가입 성공", description: "환영합니다!" });
      }
      setLocation("/");
    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: error?.message || "인증에 실패했습니다",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Country Flags Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-white to-red-600 h-2"></div>
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 py-2">
        <div className="container mx-auto px-4 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="flag-korea w-8 h-5 rounded-sm shadow-sm"></div>
            <span className="text-sm font-medium text-white/80">Republic of Korea</span>
          </div>
          <div className="flex items-center space-x-2 text-white/60">
            <i className="fas fa-exchange-alt"></i>
            <span className="text-xs">Trade Partnership</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flag-indonesia w-8 h-5 rounded-sm shadow-sm"></div>
            <span className="text-sm font-medium text-white/80">Republic of Indonesia</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md relative z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="flag-korea w-10 h-7 rounded shadow-sm"></div>
            <i className="fas fa-handshake text-2xl text-primary"></i>
            <div className="flag-indonesia w-10 h-7 rounded shadow-sm"></div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            CMARKET Trade
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {isLogin ? "계정에 로그인하세요" : "새 계정을 만드세요"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 / Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 / Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>회사 유형 / Company Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCompanyType("korean")}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        companyType === "korean"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <div className="flag-korea w-12 h-8 rounded shadow-sm"></div>
                      <span className="font-medium text-sm">한국 기업</span>
                      <span className="text-xs text-gray-500">Korean Company</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanyType("indonesian")}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        companyType === "indonesian"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                          : "border-gray-200 dark:border-gray-600 hover:border-red-300"
                      }`}
                    >
                      <div className="flag-indonesia w-12 h-8 rounded shadow-sm"></div>
                      <span className="font-medium text-sm">인도네시아 기업</span>
                      <span className="text-xs text-gray-500">Indonesian Company</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명 / Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">이름 / First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">성 / Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last"
                    />
                  </div>
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={isLoginPending || isRegisterPending}
            >
              {isLogin 
                ? (isLoginPending ? "로그인 중..." : "로그인 / Login") 
                : (isRegisterPending ? "가입 중..." : "회원가입 / Register")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin 
                ? "계정이 없으신가요? 회원가입 / Don't have an account? Register" 
                : "이미 계정이 있으신가요? 로그인 / Already have an account? Login"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
              테스트 계정 / Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                <p className="font-medium text-blue-700 dark:text-blue-300">🇰🇷 한국 테스트</p>
                <p className="text-gray-600 dark:text-gray-400">korea@test.com</p>
                <p className="text-gray-600 dark:text-gray-400">test123</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded">
                <p className="font-medium text-red-700 dark:text-red-300">🇮🇩 인도네시아 테스트</p>
                <p className="text-gray-600 dark:text-gray-400">indonesia@test.com</p>
                <p className="text-gray-600 dark:text-gray-400">test123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
