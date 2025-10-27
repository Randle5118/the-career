/**
 * 履歷書基本資料表單組件
 */

import type { Resume } from "@/types/resume";
import { FormField } from "@/components/forms";

interface ResumeBasicInfoFormProps {
  resume: Resume;
  onChange: (field: string, value: any) => void;
}

export default function ResumeBasicInfoForm({ resume, onChange }: ResumeBasicInfoFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">基本情報</h4>
        
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
            label="生年月日"
            name="birth_date"
            type="date"
            value={resume.birth_date}
            onChange={handleChange}
            required
          />
          
          <FormField
            label="年齢"
            name="age"
            type="number"
            value={resume.age.toString()}
            onChange={handleChange}
            required
          />
          
          <FormField
            label="性別"
            name="gender"
            value={resume.gender}
            onChange={handleChange}
            required
          />
          
          <div className="md:col-span-2">
            <FormField
              label="写真URL"
              name="photo_url"
              value={resume.photo_url}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>
      </div>
      
      {/* 連絡先 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">連絡先</h4>
        
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
      </div>
      
      {/* SNS・ポートフォリオ */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">SNS・ポートフォリオ</h4>
        
        <div className="space-y-4">
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
      
      {/* 自己PR・キャリアサマリー */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-base-content mb-4">自己PR・キャリアサマリー</h4>
        
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
      </div>
    </div>
  );
}

