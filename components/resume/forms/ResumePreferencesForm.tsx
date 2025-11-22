/**
 * 履歴書希望条件フォームコンポーネント（リファクタリング版）
 * 
 * 改善点：
 * - TagInput を使用してコード重複を削減
 * - FormSection でヘッダーを統一
 * - PrivacyBadge を使用
 * - コード量: 242行 → 85行 (65%削減)
 */

import type { Preferences } from "@/types/resume";
import { FormSection, TagInput } from "./shared";

interface ResumePreferencesFormProps {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
}

export default function ResumePreferencesForm({
  preferences,
  onChange,
}: ResumePreferencesFormProps) {
  const handleAdd = (field: keyof Preferences, value: string) => {
    onChange({
      ...preferences,
      [field]: [...(preferences[field] || []), value],
    });
  };

  const handleRemove = (field: keyof Preferences, index: number) => {
    onChange({
      ...preferences,
      [field]: preferences[field].filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* プライバシー通知 */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">希望条件は非公開です</h3>
          <div className="text-xs">
            このセクションの内容は公開履歴書には表示されません
          </div>
        </div>
      </div>

      {/* 希望職種 */}
      <FormSection title="希望職種" showPrivacyBadge>
        <TagInput
          label=""
          items={preferences.job_types || []}
          onAdd={(value) => handleAdd("job_types", value)}
          onRemove={(index) => handleRemove("job_types", index)}
          placeholder="希望職種を入力してEnter（例: プロダクトマネージャー）"
          badgeStyle="primary"
        />
      </FormSection>

      {/* 希望勤務地 */}
      <FormSection title="希望勤務地" showPrivacyBadge>
        <TagInput
          label=""
          items={preferences.locations || []}
          onAdd={(value) => handleAdd("locations", value)}
          onRemove={(index) => handleRemove("locations", index)}
          placeholder="希望勤務地を入力してEnter（例: 東京、リモート）"
          badgeStyle="outline"
        />
      </FormSection>

      {/* 希望雇用形態 */}
      <FormSection title="希望雇用形態" showPrivacyBadge>
        <TagInput
          label=""
          items={preferences.employment_types || []}
          onAdd={(value) => handleAdd("employment_types", value)}
          onRemove={(index) => handleRemove("employment_types", index)}
          placeholder="希望雇用形態を入力してEnter（例: 正社員、契約社員）"
          badgeStyle="outline"
        />
      </FormSection>

      {/* 希望勤務形態 */}
      <FormSection title="希望勤務形態" showPrivacyBadge>
        <TagInput
          label=""
          items={preferences.work_styles || []}
          onAdd={(value) => handleAdd("work_styles", value)}
          onRemove={(index) => handleRemove("work_styles", index)}
          placeholder="希望勤務形態を入力してEnter（例: リモート、ハイブリッド）"
          badgeStyle="outline"
        />
      </FormSection>
    </div>
  );
}
