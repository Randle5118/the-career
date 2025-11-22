"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/catalyst/heading";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ResumeCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // フォーム状態（必須フィールド + いくつかの基本フィールドのみ）
  const [formData, setFormData] = useState({
    name_kanji: "",
    email: "",
    phone: "",
    name_kana: "",
    birth_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 必須フィールドを検証
    if (!formData.name_kanji || !formData.email) {
      toast.error("名前とメールアドレスは必須です");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to create resume');
      }

      toast.success("履歴書を作成しました!");
      router.push("/dashboard/resume");
    } catch (error) {
      console.error("[Create Resume] Error:", error);
      toast.error(error instanceof Error ? error.message : "作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <div>
            <button
              onClick={handleCancel}
              className="btn btn-ghost btn-sm gap-2 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
            <Heading>履歴書を作成</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              基本情報を入力してください。詳細は後で追加できます。
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* 基本情報セクション */}
          <div className="bg-base-100 border border-base-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-base-content mb-6">
              基本情報
            </h3>
            
            <div className="space-y-6">
              {/* 名前 (漢字) - 必須 */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    名前（漢字）<span className="text-error ml-1">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name_kanji"
                  value={formData.name_kanji}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="山田 太郎"
                  required
                />
              </div>

              {/* 名前 (かな) */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">名前（かな）</span>
                </label>
                <input
                  type="text"
                  name="name_kana"
                  value={formData.name_kana}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="やまだ たろう"
                />
              </div>

              {/* 生年月日 */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">生年月日</span>
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>

              {/* メールアドレス - 必須 */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    メールアドレス<span className="text-error ml-1">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="example@email.com"
                  required
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">電話番号</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="090-1234-5678"
                />
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="text-sm">
                まずは基本情報だけで大丈夫です。学歴、職務経歴、スキルなどは作成後に追加できます。
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4 justify-end pt-6 border-t border-base-300">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  作成中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  作成する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

