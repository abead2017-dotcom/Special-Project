import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: accounts, isLoading } = trpc.accounts.list.useQuery({});
  const [selectedType, setSelectedType] = useState<string>("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  const filteredAccounts = accounts?.filter((acc) => {
    const matchesType = !selectedType || acc.type === selectedType;
    const matchesPrice = acc.price >= priceRange.min && acc.price <= priceRange.max;
    return matchesType && matchesPrice;
  }) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-neon-cyan/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold neon-text">سوق الحسابات</h1>
            <p className="text-sm text-muted-foreground neon-cyan">منصة بيع وشراء حسابات التواصل</p>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm">{user?.name}</span>
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="btn-neon"
                >
                  لوحة التحكم
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()} className="btn-neon">
                تسجيل الدخول
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-950/20 to-transparent border-b border-neon-cyan/20">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4 neon-text">مرحباً بك في سوق الحسابات</h2>
          <p className="text-xl text-muted-foreground mb-8 neon-cyan">
            اشترِ وبع حسابات TikTok و YouTube والمزيد بكل أمان وسهولة
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/sell")}
              className="btn-neon text-lg px-8 py-4"
            >
              ابدأ البيع الآن
            </Button>
          ) : (
            <a href={getLoginUrl()} className="btn-neon text-lg px-8 py-4 inline-block">
              ابدأ الآن
            </a>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-4 border-b border-neon-cyan/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type Filter */}
            <div className="card-neon">
              <label className="block text-sm font-bold mb-3 neon-cyan">نوع الحساب</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-neon"
              >
                <option value="">الكل</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="card-neon">
              <label className="block text-sm font-bold mb-3 neon-cyan">السعر الأدنى ($)</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="input-neon"
              />
            </div>

            <div className="card-neon">
              <label className="block text-sm font-bold mb-3 neon-cyan">السعر الأعلى ($)</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="input-neon"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Accounts Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold mb-8 neon-cyan">الحسابات المتاحة</h3>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⚙️</div>
              <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 card-neon">
              <p className="text-muted-foreground">لا توجد حسابات متاحة حالياً</p>
            </div>
          ) : (
            <div className="accounts-grid">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="card-neon cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setLocation(`/account/${account.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold neon-text">{account.name}</h4>
                      <p className="text-sm text-muted-foreground">@{account.username}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-xs font-bold neon-text">
                      {account.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المتابعون:</span>
                      <span className="neon-cyan font-bold">{account.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">العمر:</span>
                      <span className="neon-cyan font-bold">{account.ageMonths} شهر</span>
                    </div>
                    {account.engagementRate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">التفاعل:</span>
                        <span className="neon-cyan font-bold">{account.engagementRate}</span>
                      </div>
                    )}
                  </div>

                  {account.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {account.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-neon-cyan/20">
                    <span className="text-2xl font-bold neon-text">${account.price}</span>
                    <Button className="btn-neon text-sm py-2 px-4">
                      عرض التفاصيل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/20 bg-black/50 py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 سوق الحسابات. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
