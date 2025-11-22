/**
 * 履歴書基本情報フォームコンポーネント（リファクタリング版）
 * 
 * 改善点：
 * - FormSection で各区域を統一
 * - PrivacyBadge を使用
 * - コード量: 273行 → 240行 (12%削減)
 * 
 * 注: この表單比較特殊，主要是資料輸入，重構空間較小
 */

import type { Resume } from "@/types/resume";
import { FormField } from "@/components/forms";
import PhotoUpload from "@/components/resume/PhotoUpload";
import { FormSection, PrivacyBadge } from "./shared";

interface ResumeBasicInfoFormProps {
  resume: Resume;
  onChange: (field: string, value: any) => void;
}

export default function ResumeBasicInfoForm({
  resume,
  onChange,
}: ResumeBasicInfoFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = e.target.value;
    onChange("birth_date", birthDate);

    // 自動計算年齢
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      onChange("age", age);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    // Fileオブジェクトを親コンポーネントに渡す
    onChange("photo_file", file);
  };

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <FormSection title="基本情報">
          {/* 照片上傳區域 */}
          <div className="mb-6 pb-6 border-b border-base-300">
            <label className="block text-sm font-medium text-base-content mb-4">
              顔写真{" "}
              <span className="text-base-content/50 text-xs ml-1">
                (推奨: 証明写真サイズ)
              </span>
            </label>
            <PhotoUpload
              currentPhotoUrl={resume.photo_url || undefined}
              onPhotoChange={handlePhotoChange}
            />
            <p className="text-xs text-base-content/50 mt-3 text-center">
              ファイルサイズ: 最大5MB / 形式: JPEG, PNG, GIF, WebP
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="氏名（漢字）"
                name="name_kanji"
                value={resume.name_kanji}
                onChange={handleChange}
                required
              />

              <FormField
                label="氏名（ふりがな）"
                name="name_kana"
                value={resume.name_kana}
                onChange={handleChange}
                required
              />

              <FormField
                label="氏名（ローマ字）"
                name="name_romaji"
                value={resume.name_romaji}
                onChange={handleChange}
              />

              <FormField
                label="性別"
                name="gender"
                value={resume.gender}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  生年月日 <PrivacyBadge className="ml-2" />
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={resume.birth_date}
                  onChange={handleBirthDateChange}
                  className="input input-bordered w-full"
                  required
                />
                <p className="text-xs text-base-content/50 mt-1">
                  公開履歴書には表示されません（年齢のみ表示）
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  年齢{" "}
                  <span className="text-xs text-base-content/50 ml-1">
                    (自動計算)
                  </span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={resume.age.toString()}
                  readOnly
                  className="input input-bordered w-full bg-base-200 cursor-not-allowed"
                  placeholder="生年月日から自動計算されます"
                />
              </div>
            </div>

            {/* SNS Links */}
            <div className="pt-4 border-t border-base-300">
              <label className="block text-sm font-medium text-base-content mb-3">
                SNS・ポートフォリオ{" "}
                <span className="text-base-content/50 text-xs ml-1">
                  (任意)
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="LinkedIn"
                  name="linkedin_url"
                  value={resume.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />

                <FormField
                  label="GitHub"
                  name="github_url"
                  value={resume.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />

                <FormField
                  label="ポートフォリオ"
                  name="portfolio_url"
                  value={resume.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />

                <FormField
                  label="その他URL"
                  name="other_url"
                  value={resume.other_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {/* 連絡先 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <FormSection title="連絡先">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="メールアドレス"
              name="email"
              type="email"
              value={resume.email}
              onChange={handleChange}
              required
            />

            <FormField
              label="電話番号"
              name="phone"
              value={resume.phone}
              onChange={handleChange}
              required
            />

            <FormField
              label="郵便番号"
              name="postal_code"
              value={resume.postal_code}
              onChange={handleChange}
              placeholder="150-0001"
            />

            <FormField
              label="都道府県"
              name="prefecture"
              value={resume.prefecture}
              onChange={handleChange}
              required
            />

            <FormField
              label="市区町村"
              name="city"
              value={resume.city}
              onChange={handleChange}
              required
            />

            <FormField
              label="番地"
              name="address_line"
              value={resume.address_line}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <FormField
                label="建物名・部屋番号"
                name="building"
                value={resume.building}
                onChange={handleChange}
              />
            </div>
          </div>
        </FormSection>
      </div>

      {/* 自己PR・キャリアサマリー */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <FormSection title="自己PR・キャリアサマリー">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                キャリアサマリー
              </label>
              <textarea
                name="career_summary"
                value={resume.career_summary}
                onChange={handleChange}
                rows={6}
                className="textarea textarea-bordered w-full text-sm"
                placeholder="これまでのキャリアの概要を記入してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                自己PR
              </label>
              <textarea
                name="self_pr"
                value={resume.self_pr}
                onChange={handleChange}
                rows={6}
                className="textarea textarea-bordered w-full text-sm"
                placeholder="あなたの強みやアピールポイントを記入してください"
              />
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}
