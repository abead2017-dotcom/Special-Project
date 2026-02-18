import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export default function SellAccount() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const createAccountMutation = trpc.accounts.create.useMutation();

  const [formData, setFormData] = useState({
    type: "tiktok",
    name: "",
    username: "",
    followers: 0,
    ageMonths: 0,
    price: 0,
    description: "",
    engagementRate: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "followers" || name === "ageMonths" || name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        type: formData.type as "tiktok" | "youtube" | "instagram",
      };
      await createAccountMutation.mutateAsync(payload);
      alert("تم إضافة الحساب بنجاح!");
      setFormData({
        type: "tiktok",
        name: "",
        username: "",
        followers: 0,
        ageMonths: 0,
        price: 0,
        description: "",
        engagementRate: "",
      });
      setLocation("/dashboard");
    } catch (error) {
      alert("حدث خطأ في إضافة الحساب");
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-neon-cyan/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => setLocation("/")}
            className="btn-neon"
          >
            ← العودة
          </Button>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="card-neon">
          <h1 className="text-3xl font-bold neon-text mb-8">إضافة حساب للبيع</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">نوع الحساب</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input-neon"
              >
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">اسم الحساب</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="مثال: حساب تسويق رقمي"
                className="input-neon"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">اسم المستخدم</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="مثال: @digital_marketing"
                className="input-neon"
                required
              />
            </div>

            {/* Followers */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">عدد المتابعين</label>
              <input
                type="number"
                name="followers"
                value={formData.followers}
                onChange={handleInputChange}
                placeholder="0"
                className="input-neon"
                required
              />
            </div>

            {/* Account Age */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">عمر الحساب (بالأشهر)</label>
              <input
                type="number"
                name="ageMonths"
                value={formData.ageMonths}
                onChange={handleInputChange}
                placeholder="0"
                className="input-neon"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">السعر ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                className="input-neon"
                required
              />
            </div>

            {/* Engagement Rate */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">معدل التفاعل (اختياري)</label>
              <input
                type="text"
                name="engagementRate"
                value={formData.engagementRate}
                onChange={handleInputChange}
                placeholder="مثال: 5.2%"
                className="input-neon"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold neon-cyan mb-3">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="اكتب وصفاً مفصلاً عن الحساب..."
                rows={6}
                className="input-neon"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={createAccountMutation.isPending}
                className="btn-neon flex-1"
              >
                {createAccountMutation.isPending ? "جاري الإضافة..." : "إضافة الحساب"}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation("/")}
                className="btn-neon flex-1 opacity-50"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
