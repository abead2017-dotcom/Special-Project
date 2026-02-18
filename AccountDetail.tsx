import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";

export default function AccountDetail() {
  const [match, params] = useRoute("/account/:id");
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const accountId = params?.id ? Number(params.id) : null;

  const { data: account, isLoading } = trpc.accounts.getById.useQuery(accountId || 0, {
    enabled: !!accountId,
  });

  const { data: reviews } = trpc.reviews.getByAccount.useQuery(accountId || 0, {
    enabled: !!accountId,
  });

  const createPurchaseMutation = trpc.purchases.create.useMutation();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const handlePurchase = async () => {
    if (!account || !user) return;

    try {
      await createPurchaseMutation.mutateAsync({
        accountId: account.id,
        price: account.price,
        sellerId: account.sellerId,
      });
      alert("تم إنشاء طلب الشراء بنجاح!");
      setShowPurchaseForm(false);
    } catch (error) {
      alert("حدث خطأ في إنشاء الطلب");
    }
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="card-neon text-center">
          <p className="text-muted-foreground mb-4">الحساب غير موجود</p>
          <Button
            onClick={() => setLocation("/")}
            className="btn-neon"
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-neon-cyan/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => setLocation("/")}
            className="btn-neon mb-4"
          >
            ← العودة
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info */}
          <div className="lg:col-span-2">
            <div className="card-neon mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-bold neon-text mb-2">{account.name}</h1>
                  <p className="text-lg text-muted-foreground">@{account.username}</p>
                </div>
                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded text-sm font-bold neon-text">
                  {account.type.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-neon-cyan/20">
                <div className="card-neon">
                  <p className="text-muted-foreground text-sm">المتابعون</p>
                  <p className="text-2xl font-bold neon-cyan">{account.followers.toLocaleString()}</p>
                </div>
                <div className="card-neon">
                  <p className="text-muted-foreground text-sm">العمر</p>
                  <p className="text-2xl font-bold neon-cyan">{account.ageMonths} شهر</p>
                </div>
                {account.engagementRate && (
                  <div className="card-neon">
                    <p className="text-muted-foreground text-sm">التفاعل</p>
                    <p className="text-2xl font-bold neon-cyan">{account.engagementRate}</p>
                  </div>
                )}
                {account.qualityScore && account.qualityScore > 0 && (
                  <div className="card-neon">
                    <p className="text-muted-foreground text-sm">جودة الحساب</p>
                    <p className="text-2xl font-bold neon-cyan">{account.qualityScore}/100</p>
                  </div>
                )}
              </div>

              {account.description && (
                <div>
                  <h3 className="text-lg font-bold neon-cyan mb-3">الوصف</h3>
                  <p className="text-muted-foreground leading-relaxed">{account.description}</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="card-neon">
                <h3 className="text-lg font-bold neon-cyan mb-6">التقييمات ({reviews.length})</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-neon-cyan/20 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-600"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <div className="card-neon sticky top-24">
              <div className="mb-6">
                <p className="text-muted-foreground text-sm mb-2">السعر</p>
                <p className="text-4xl font-bold neon-text">${account.price}</p>
              </div>

              {averageRating && (
                <div className="mb-6 pb-6 border-b border-neon-cyan/20">
                  <p className="text-muted-foreground text-sm mb-2">التقييم</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold neon-cyan">{averageRating}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-600"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <>
                  {user?.id !== account.sellerId ? (
                    <>
                      <Button
                        onClick={() => setShowPurchaseForm(!showPurchaseForm)}
                        className="btn-neon w-full mb-3"
                      >
                        شراء الآن
                      </Button>

                      {showPurchaseForm && (
                        <div className="bg-black/50 p-4 rounded border border-neon-cyan/30 mb-3">
                          <p className="text-sm text-muted-foreground mb-4">
                            هل أنت متأكد من رغبتك في شراء هذا الحساب بسعر ${account.price}؟
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={handlePurchase}
                              disabled={createPurchaseMutation.isPending}
                              className="btn-neon flex-1 text-sm py-2"
                            >
                              تأكيد
                            </Button>
                            <Button
                              onClick={() => setShowPurchaseForm(false)}
                              className="btn-neon flex-1 text-sm py-2 opacity-50"
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded text-sm">
                      <p className="text-muted-foreground">هذا حسابك الخاص</p>
                    </div>
                  )}
                </>
              ) : (
                <a href="/login" className="btn-neon w-full block text-center">
                  سجل الدخول للشراء
                </a>
              )}

              <div className="mt-6 pt-6 border-t border-neon-cyan/20">
                <p className="text-xs text-muted-foreground">
                  معرّف الحساب: <span className="neon-cyan font-mono">{account.id}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  تم الإضافة: {new Date(account.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
