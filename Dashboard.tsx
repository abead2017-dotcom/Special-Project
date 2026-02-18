import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"sales" | "purchases">("sales");

  const { data: mySales, isLoading: loadingSales } = trpc.accounts.getMySales.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myPurchases, isLoading: loadingPurchases } = trpc.purchases.getMyPurchases.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="card-neon text-center">
          <h2 className="text-2xl font-bold neon-text mb-4">يجب تسجيل الدخول أولاً</h2>
          <a href={getLoginUrl()} className="btn-neon inline-block">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-neon-cyan/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold neon-text">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">مرحباً {user?.name}</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setLocation("/sell")}
              className="btn-neon"
            >
              بيع حساب جديد
            </Button>
            <Button
              onClick={handleLogout}
              className="btn-neon opacity-50"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-neon-cyan/20 bg-black/30 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("sales")}
              className={`py-4 font-bold border-b-2 transition-colors ${
                activeTab === "sales"
                  ? "border-neon-cyan text-neon-cyan"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              حساباتي للبيع ({mySales?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`py-4 font-bold border-b-2 transition-colors ${
                activeTab === "purchases"
                  ? "border-neon-cyan text-neon-cyan"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              مشترياتي ({myPurchases?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {activeTab === "sales" && (
          <div>
            <h2 className="text-2xl font-bold neon-cyan mb-8">حساباتي للبيع</h2>

            {loadingSales ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : mySales && mySales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySales.map((account) => (
                  <div key={account.id} className="card-neon">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold neon-text">{account.name}</h3>
                        <p className="text-sm text-muted-foreground">@{account.username}</p>
                      </div>
                      <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-xs font-bold neon-text">
                        {account.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المتابعون:</span>
                        <span className="neon-cyan font-bold">{account.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">السعر:</span>
                        <span className="neon-text font-bold">${account.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الحالة:</span>
                        <span className={`font-bold ${
                          account.status === "active" ? "text-green-400" : "text-red-400"
                        }`}>
                          {account.status === "active" ? "نشط" : "مباع"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-neon-cyan/20">
                      <Button
                        onClick={() => setLocation(`/account/${account.id}`)}
                        className="btn-neon flex-1 text-sm py-2"
                      >
                        عرض
                      </Button>
                      {account.status === "active" && (
                        <Button
                          className="btn-neon flex-1 text-sm py-2 opacity-50"
                        >
                          تعديل
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-neon text-center py-12">
                <p className="text-muted-foreground mb-4">لم تضف أي حسابات للبيع بعد</p>
                <Button
                  onClick={() => setLocation("/sell")}
                  className="btn-neon"
                >
                  إضافة حساب الآن
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            <h2 className="text-2xl font-bold neon-cyan mb-8">مشترياتي</h2>

            {loadingPurchases ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : myPurchases && myPurchases.length > 0 ? (
              <div className="space-y-4">
                {myPurchases.map((purchase) => (
                  <div key={purchase.id} className="card-neon">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold neon-text">طلب شراء #{purchase.id}</p>
                        <p className="text-sm text-muted-foreground">
                          الحساب: {purchase.accountId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold neon-text">${purchase.price}</p>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-bold mt-2 ${
                          purchase.status === "completed"
                            ? "bg-green-500/20 border border-green-500/50 text-green-400"
                            : purchase.status === "pending"
                            ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-400"
                            : "bg-red-500/20 border border-red-500/50 text-red-400"
                        }`}>
                          {purchase.status === "completed" ? "مكتمل" : purchase.status === "pending" ? "قيد الانتظار" : "ملغى"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(purchase.purchasedAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-neon text-center py-12">
                <p className="text-muted-foreground mb-4">لم تشتر أي حسابات بعد</p>
                <Button
                  onClick={() => setLocation("/")}
                  className="btn-neon"
                >
                  استكشف الحسابات المتاحة
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
