"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";
import { useEffect } from "react";
import { checkUsernameAvailable } from "@/features/auth/apis";
import { useSignupIndonesia } from "@/features/auth/mutations";

const PROVINSI_LIST = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Bengkulu", "Sumatera Selatan", "Kepulauan Bangka Belitung",
  "Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah",
  "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat",
  "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara",
  "Papua Barat", "Papua",
];

const BUSINESS_CATEGORIES = [
  "제조업 (Manufaktur)", "건설업 (Konstruksi)", "무역/유통 (Perdagangan)",
  "서비스업 (Jasa)", "농업/어업 (Pertanian/Perikanan)", "광업 (Pertambangan)",
  "IT/기술 (Teknologi)", "의료/보건 (Kesehatan)", "교육 (Pendidikan)", "기타 (Lainnya)",
];

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "직접 입력"];

const PHONE_AREA_CODES = ["없음", "+62", "+82", "+1", "+81", "+86"];

type FormData = {
  username: string;
  password: string;
  passwordConfirm: string;
  managerName: string;
  managerTitle: string;
  managerDept: string;
  mobileCode: string;
  mobile1: string;
  mobile2: string;
  phoneCode: string;
  phone1: string;
  phone2: string;
  faxCode: string;
  fax1: string;
  fax2: string;
  emailId: string;
  emailDomain: string;
  emailDomainCustom: string;
  npwp: string;
  nib: string;
  companyName: string;
  representativeName: string;
  provinsi: string;
  city: string;
  addressBase: string;
  addressDetail: string;
  businessCategory: string;
  businessItem: string;
};

type FieldError = Partial<Record<keyof FormData, string>>;

function formatNpwp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/(\d{2}\.\d{3}\.\d{3})(\d)/, "$1.$2")
    .replace(/(\d{2}\.\d{3}\.\d{3}\.\d)(\d)/, "$1-$2")
    .replace(/(\d{2}\.\d{3}\.\d{3}\.\d-\d{3})(\d)/, "$1.$2");
}

type PasswordRule = { label: string; test: (pw: string) => boolean };

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8자 이상", test: (pw) => pw.length >= 8 },
  { label: "대문자 포함", test: (pw) => /[A-Z]/.test(pw) },
  { label: "숫자 포함", test: (pw) => /[0-9]/.test(pw) },
  { label: "특수문자 포함", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "약함", color: "bg-red-400" };
  if (score <= 2) return { level: 2, label: "보통", color: "bg-yellow-400" };
  if (score <= 3) return { level: 3, label: "강함", color: "bg-blue-400" };
  return { level: 4, label: "매우 강함", color: "bg-green-400" };
}

function inputCn(hasError: boolean): string {
  return cn(
    "w-full px-4 py-3 border rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF]",
    "focus:outline-none focus:ring-1 transition-colors bg-white",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-400"
      : "border-[#E2E8F0] focus:border-imsg-blue focus:ring-imsg-blue",
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

function Field({ label, required, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#374151]">
        {label}
        {required && <span className="text-imsg-blue ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Section({ title, description, children }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-[#E2E8F0] pb-2">
        <h2 className="text-base font-bold text-[#1F2937]">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

type PhoneRowProps = {
  label: string;
  required?: boolean;
  code: string;
  num1: string;
  num2: string;
  onCodeChange: (v: string) => void;
  onNum1Change: (v: string) => void;
  onNum2Change: (v: string) => void;
  hasError?: boolean;
};

function PhoneRow({ label, required, code, num1, num2, onCodeChange, onNum1Change, onNum2Change, hasError }: PhoneRowProps) {
  const isDisabled = code === "없음";
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#374151] w-12 flex-shrink-0">
        {label}
        {required && <span className="text-imsg-blue ml-0.5">*</span>}
      </span>
      <select
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className={cn(
          "px-2 py-3 border rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-1 transition-colors bg-white w-24",
          hasError ? "border-red-400" : "border-[#E2E8F0] focus:border-imsg-blue focus:ring-imsg-blue",
        )}
      >
        {PHONE_AREA_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <span className="text-[#9CA3AF]">-</span>
      <input
        type="text"
        value={num1}
        onChange={(e) => onNum1Change(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="0000"
        disabled={isDisabled}
        className={cn(
          "w-20 px-3 py-3 border rounded-lg text-sm text-center placeholder:text-[#D1D5DB]",
          "focus:outline-none focus:ring-1 transition-colors",
          isDisabled ? "bg-[#F9FAFB] border-[#E2E8F0] text-[#9CA3AF]" :
          hasError ? "border-red-400 bg-white" : "border-[#E2E8F0] focus:border-imsg-blue focus:ring-imsg-blue bg-white",
        )}
      />
      <span className="text-[#9CA3AF]">-</span>
      <input
        type="text"
        value={num2}
        onChange={(e) => onNum2Change(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="0000"
        disabled={isDisabled}
        className={cn(
          "w-20 px-3 py-3 border rounded-lg text-sm text-center placeholder:text-[#D1D5DB]",
          "focus:outline-none focus:ring-1 transition-colors",
          isDisabled ? "bg-[#F9FAFB] border-[#E2E8F0] text-[#9CA3AF]" :
          hasError ? "border-red-400 bg-white" : "border-[#E2E8F0] focus:border-imsg-blue focus:ring-imsg-blue bg-white",
        )}
      />
    </div>
  );
}

export function SignupInfoIndonesia() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const country = searchParams.get("country");
  const [form, setForm] = useState<FormData>({
    username: "", password: "", passwordConfirm: "",
    managerName: "", managerTitle: "", managerDept: "",
    mobileCode: "+62", mobile1: "", mobile2: "",
    phoneCode: "없음", phone1: "", phone2: "",
    faxCode: "없음", fax1: "", fax2: "",
    emailId: "", emailDomain: "gmail.com", emailDomainCustom: "",
    npwp: "", nib: "", companyName: "", representativeName: "",
    provinsi: "", city: "", addressBase: "", addressDetail: "",
    businessCategory: "", businessItem: "",
  });
  const { mutate: signup, isPending } = useSignupIndonesia();
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const passwordMatch = form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;
  const passwordMismatch = form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm;
  const passwordStrength = getPasswordStrength(form.password);
  const isCustomDomain = form.emailDomain === "직접 입력";

  useEffect(() => {
    if (country !== "indonesia") {
      router.replace("/not-found");
    }
  }, [country, router]);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "username") setUsernameStatus("idle");
  }

  async function handleCheckUsername() {
    if (form.username.length < 4) {
      setErrors((prev) => ({ ...prev, username: "아이디는 4자 이상 입력해주세요." }));
      return;
    }
    setUsernameStatus("checking");
    try {
      const available = await checkUsernameAvailable(form.username);
      setUsernameStatus(available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }

  function validate(): boolean {
    const newErrors: FieldError = {};
    if (!form.username || form.username.length < 4) newErrors.username = "아이디는 6자 이상 입력해주세요.";
    else if (usernameStatus !== "available") newErrors.username = "아이디 중복확인을 해주세요.";
    if (!form.password || form.password.length < 8) newErrors.password = "비밀번호는 8자 이상 입력해주세요.";
    if (passwordMismatch || !form.passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (!form.managerName) newErrors.managerName = "담당자 성명을 입력해주세요.";
    if (form.mobileCode !== "없음" && (!form.mobile1 || !form.mobile2)) newErrors.mobile1 = "핸드폰 번호를 입력해주세요.";
    if (!form.emailId) newErrors.emailId = "이메일을 입력해주세요.";
    if (!form.npwp || form.npwp.replace(/\D/g, "").length < 15) newErrors.npwp = "NPWP 15자리를 입력해주세요.";
    if (!form.nib) newErrors.nib = "NIB를 입력해주세요.";
    if (!form.companyName) newErrors.companyName = "회사명을 입력해주세요.";
    if (!form.representativeName) newErrors.representativeName = "대표자 성명을 입력해주세요.";
    if (!form.provinsi) newErrors.provinsi = "주(Provinsi)를 선택해주세요.";
    if (!form.city) newErrors.city = "시/군을 입력해주세요.";
    if (!form.addressBase) newErrors.addressBase = "기본 주소를 입력해주세요.";
    if (!form.businessCategory) newErrors.businessCategory = "사업 분야를 선택해주세요.";
    console.log("validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    console.log("handleNext 실행됨", form);
    const isValid = validate();
	  console.log("validate 결과:", isValid);
    if (!isValid) return;
  
    const domain = isCustomDomain ? form.emailDomainCustom : form.emailDomain;
    const email = `${form.emailId}@${domain}`;
    const mobile =
      form.mobileCode !== "없음" && form.mobile1 && form.mobile2
        ? `${form.mobileCode}-${form.mobile1}-${form.mobile2}`
        : "";
    const phone =
      form.phoneCode !== "없음" && form.phone1 && form.phone2
        ? `${form.phoneCode}-${form.phone1}-${form.phone2}`
        : "";
    const fax =
      form.faxCode !== "없음" && form.fax1 && form.fax2
        ? `${form.faxCode}-${form.fax1}-${form.fax2}`
        : "";
  
    signup(
      {
        username: form.username,
        password: form.password,
        email,
        managerName: form.managerName,
        managerTitle: form.managerTitle,
        managerDept: form.managerDept,
        mobile,
        phone,
        fax,
        npwp: form.npwp,
        nib: form.nib,
        companyName: form.companyName,
        representativeName: form.representativeName,
        provinsi: form.provinsi,
        city: form.city,
        addressBase: form.addressBase,
        addressDetail: form.addressDetail,
        businessCategory: form.businessCategory,
        businessItem: form.businessItem,
      },
      {
        onSuccess: () => router.push("/signup/complete"),
        onError: (err) => alert(err.message),
      },
    );
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "#F0F5FF" }}>
      <header className="border-b border-[#E2E8F0] px-4 py-4 sm:px-6 sm:py-5 bg-white flex justify-center">
        <div className="flex items-center justify-between w-full max-w-2xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </button>
          <div className="text-sm font-semibold text-foreground">3 / 4</div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#1F2937]">정보 입력</h1>
            <p className="text-sm text-muted-foreground">발주기관 정보를 입력해 주세요.</p>
          </div>

          {/* 계정 생성 */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
            <Section title="계정 생성" description="로그인 정보를 입력해 주세요.">
            <Field label="아이디" required error={errors.username}>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoComplete="off"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="4자 이상 영문/숫자"
                  className={cn(inputCn(!!errors.username), "flex-1")}
                />
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={usernameStatus === "checking" || form.username.length < 4}
                  className="px-4 py-3 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-imsg-blue text-imsg-blue hover:bg-[#EFF6FF]"
                >
                  {usernameStatus === "checking" ? "확인 중..." : "중복확인"}
                </button>
              </div>
              {usernameStatus === "available" && (
                <p className="text-xs text-green-500">사용 가능한 아이디입니다.</p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-xs text-red-500">이미 사용 중인 아이디입니다.</p>
              )}
            </Field>

              <div className="grid grid-cols-2 gap-3">
                {/* 비밀번호 */}
                <Field label="비밀번호" required error={errors.password}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="비밀번호 입력"
                      className={cn(inputCn(!!errors.password), "pr-10")}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* 강도 바 */}
                  {form.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i <= passwordStrength.level ? passwordStrength.color : "bg-[#E2E8F0]",
                          )} />
                        ))}
                      </div>
                      <p className={cn("text-xs",
                        passwordStrength.level === 1 ? "text-red-500" :
                        passwordStrength.level === 2 ? "text-yellow-500" :
                        passwordStrength.level === 3 ? "text-blue-500" : "text-green-500",
                      )}>
                        강도: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                  {/* 조건 체크리스트 */}
                  <div className="mt-2 space-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(form.password);
                      return (
                        <p key={rule.label} className={cn(
                          "text-xs flex items-center gap-1 transition-colors",
                          form.password.length === 0 ? "text-[#9CA3AF]" :
                          passed ? "text-green-500" : "text-red-400",
                        )}>
                          <span className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            {form.password.length === 0 ? "·" : passed ? "✓" : "✗"}
                          </span>
                          {rule.label}
                        </p>
                      );
                    })}
                  </div>
                </Field>

                {/* 비밀번호 확인 */}
                <Field label="비밀번호 확인" required error={errors.passwordConfirm}>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.passwordConfirm}
                      onChange={(e) => handleChange("passwordConfirm", e.target.value)}
                      placeholder="비밀번호 재입력"
                      className={cn(
                        "w-full px-4 py-3 pr-10 border rounded-lg text-sm text-[#1F2937] placeholder:text-[#9CA3AF]",
                        "focus:outline-none focus:ring-1 transition-colors bg-white",
                        passwordMatch ? "border-green-400 focus:border-green-400 focus:ring-green-400" :
                        passwordMismatch ? "border-red-400 focus:border-red-400 focus:ring-red-400" :
                        "border-[#E2E8F0] focus:border-imsg-blue focus:ring-imsg-blue",
                      )}
                    />
                    <button
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
                    >
                      {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordMatch && (
                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1">✓ 비밀번호가 일치합니다.</p>
                  )}
                  {passwordMismatch && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">✗ 비밀번호가 일치하지 않습니다.</p>
                  )}
                </Field>
              </div>
            </Section>
          </div>

          {/* 담당자 */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
            <Section title="담당자" description="실무 담당자 정보를 입력해 주세요.">
              <Field label="성명 및 직책" required error={errors.managerName}>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.managerName}
                    onChange={(e) => handleChange("managerName", e.target.value)}
                    placeholder="성명"
                    className={inputCn(!!errors.managerName)}
                  />
                  <input
                    type="text"
                    value={form.managerTitle}
                    onChange={(e) => handleChange("managerTitle", e.target.value)}
                    placeholder="직위"
                    className={inputCn(false)}
                  />
                </div>
                <input
                  type="text"
                  value={form.managerDept}
                  onChange={(e) => handleChange("managerDept", e.target.value)}
                  placeholder="부서"
                  className={cn(inputCn(false), "mt-2")}
                />
              </Field>

              {/* 연락처 3개 */}
              <Field label="연락처" required error={errors.mobile1}>
                <div className="space-y-3">
                  <PhoneRow
                    label="핸드폰"
                    required
                    code={form.mobileCode}
                    num1={form.mobile1}
                    num2={form.mobile2}
                    onCodeChange={(v) => handleChange("mobileCode", v)}
                    onNum1Change={(v) => handleChange("mobile1", v)}
                    onNum2Change={(v) => handleChange("mobile2", v)}
                    hasError={!!errors.mobile1}
                  />
                  <PhoneRow
                    label="전화"
                    required
                    code={form.phoneCode}
                    num1={form.phone1}
                    num2={form.phone2}
                    onCodeChange={(v) => handleChange("phoneCode", v)}
                    onNum1Change={(v) => handleChange("phone1", v)}
                    onNum2Change={(v) => handleChange("phone2", v)}
                  />
                  <PhoneRow
                    label="팩스"
                    code={form.faxCode}
                    num1={form.fax1}
                    num2={form.fax2}
                    onCodeChange={(v) => handleChange("faxCode", v)}
                    onNum1Change={(v) => handleChange("fax1", v)}
                    onNum2Change={(v) => handleChange("fax2", v)}
                  />
                </div>
              </Field>

              <Field label="이메일" required error={errors.emailId}>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={form.emailId}
                    onChange={(e) => handleChange("emailId", e.target.value)}
                    placeholder="아이디"
                    className={cn(inputCn(!!errors.emailId), "flex-1")}
                  />
                  <span className="text-[#9CA3AF] text-sm flex-shrink-0">@</span>
                  {isCustomDomain ? (
                    <input
                      type="text"
                      value={form.emailDomainCustom}
                      onChange={(e) => handleChange("emailDomainCustom", e.target.value)}
                      placeholder="도메인 입력"
                      className={cn(inputCn(false), "flex-1")}
                    />
                  ) : (
                    <span className="flex-1 text-sm text-[#374151] px-4 py-3 border border-[#E2E8F0] rounded-lg bg-[#F9FAFB]">
                      {form.emailDomain}
                    </span>
                  )}
                </div>
                <select
                  value={form.emailDomain}
                  onChange={(e) => handleChange("emailDomain", e.target.value)}
                  className={cn(inputCn(false), "mt-2")}
                >
                  {EMAIL_DOMAINS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
            </Section>
          </div>

          {/* 사업자 정보 */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
            <Section title="사업자 정보 입력" description="발주기관 구분을 선택하고 정보를 입력해 주세요.">
              <Field label="NPWP (세금번호)" required error={errors.npwp}
                hint="인도네시아 국세청(DJP)에서 발급된 15자리 세금번호">
                <input
                  type="text"
                  value={form.npwp}
                  onChange={(e) => handleChange("npwp", formatNpwp(e.target.value))}
                  placeholder="00.000.000.0-000.000"
                  className={inputCn(!!errors.npwp)}
                />
              </Field>

              <Field label="NIB (사업등록번호)" required error={errors.nib}
                hint="OSS(Online Single Submission)에서 발급된 13자리 번호">
                <input
                  type="text"
                  value={form.nib}
                  onChange={(e) => handleChange("nib", e.target.value)}
                  placeholder="0000000000000"
                  maxLength={13}
                  className={inputCn(!!errors.nib)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="회사명 (Nama Perusahaan)" required error={errors.companyName}>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="PT. 회사명"
                    className={inputCn(!!errors.companyName)}
                  />
                </Field>
                <Field label="대표자 성명" required error={errors.representativeName}>
                  <input
                    type="text"
                    value={form.representativeName}
                    onChange={(e) => handleChange("representativeName", e.target.value)}
                    placeholder="대표자 성명"
                    className={inputCn(!!errors.representativeName)}
                  />
                </Field>
              </div>

              {/* 사업장 소재지 */}
              <Field label="사업장 소재지" required error={errors.provinsi || errors.city || errors.addressBase}>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={form.provinsi}
                      onChange={(e) => handleChange("provinsi", e.target.value)}
                      className={inputCn(!!errors.provinsi)}
                    >
                      <option value="">주(Provinsi) 선택</option>
                      {PROVINSI_LIST.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="시/군 (Kota/Kabupaten)"
                      className={inputCn(!!errors.city)}
                    />
                  </div>
                  <input
                    type="text"
                    value={form.addressBase}
                    onChange={(e) => handleChange("addressBase", e.target.value)}
                    placeholder="기본 주소"
                    className={inputCn(!!errors.addressBase)}
                  />
                  <input
                    type="text"
                    value={form.addressDetail}
                    onChange={(e) => handleChange("addressDetail", e.target.value)}
                    placeholder="상세주소를 입력해주세요 (선택)"
                    className={inputCn(false)}
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="업태" error={errors.businessCategory}>
                  <select
                    value={form.businessCategory}
                    onChange={(e) => handleChange("businessCategory", e.target.value)}
                    className={inputCn(!!errors.businessCategory)}
                  >
                    <option value="">예: 서비스업</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </Field>
                <Field label="종목">
                  <input
                    type="text"
                    value={form.businessItem}
                    onChange={(e) => handleChange("businessItem", e.target.value)}
                    placeholder="예: 소프트웨어 개발"
                    className={inputCn(false)}
                  />
                </Field>
              </div>
            </Section>
          </div>

          <button
            onClick={handleNext}
            disabled={isPending}
            className="w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2 bg-imsg-blue hover:bg-[#2563EB] text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "처리 중..." : "회원가입 완료"}
            {!isPending && <ChevronRight className="w-4 h-4" />}
          </button>

          <footer className="py-2 text-center text-xs text-[#9CA3AF]">
            © 2003 Cmarket Corp. All rights reserved.
          </footer>
        </div>
      </div>
    </main>
  );
}