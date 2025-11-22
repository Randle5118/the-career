/**
 * 履歴書言語・受賞歴フォームコンポーネント（リファクタリング版）
 * 
 * 改善点：
 * - useControlledArrayField で状態管理を統一（2箇所）
 * - FormSection で Header を統一
 * - FormCard で卡片容器を統一
 * - コード量: 204行 → 125行 (39%削減)
 */

import type { Language, Award } from "@/types/resume";
import { FormField, FormSelect, type SelectOption } from "@/components/forms";
import { Languages, Award as AwardIcon } from "lucide-react";
import {
  FormSection,
  FormCard,
  useControlledArrayField,
} from "./shared";

interface ResumeLanguagesAwardsFormProps {
  languages: Language[];
  awards: Award[];
  onLanguagesChange: (languages: Language[]) => void;
  onAwardsChange: (awards: Award[]) => void;
}

const languageLevelOptions: SelectOption[] = [
  { value: "ネイティブ", label: "ネイティブ" },
  { value: "ビジネスレベル", label: "ビジネスレベル" },
  { value: "日常会話", label: "日常会話" },
  { value: "初級", label: "初級" },
];

export default function ResumeLanguagesAwardsForm({
  languages,
  awards,
  onLanguagesChange,
  onAwardsChange,
}: ResumeLanguagesAwardsFormProps) {
  // Languages 管理
  const languageHelpers = useControlledArrayField(
    languages,
    onLanguagesChange,
    () => ({ name: "", level: "" })
  );

  // Awards 管理
  const awardHelpers = useControlledArrayField(
    awards,
    onAwardsChange,
    () => ({ date: "", title: "", organization: "" })
  );

  return (
    <div className="space-y-6">
      {/* 言語 */}
      <FormSection title="言語" onAdd={languageHelpers.add}>
        {languages.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            言語を追加してください
          </div>
        ) : (
          <div className="space-y-3">
            {languages.map((lang, index) => (
              <FormCard
                key={index}
                compact
                onRemove={() => languageHelpers.remove(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      label="言語名"
                      name={`lang-${index}-name`}
                      value={lang.name}
                      onChange={(e) =>
                        languageHelpers.update(index, "name", e.target.value)
                      }
                      placeholder="日本語、英語など"
                      required
                    />

                    <FormSelect
                      label="レベル"
                      name={`lang-${index}-level`}
                      value={lang.level}
                      onChange={(e) =>
                        languageHelpers.update(index, "level", e.target.value)
                      }
                      options={languageLevelOptions}
                      required
                    />
                  </div>
                </div>
              </FormCard>
            ))}
          </div>
        )}
      </FormSection>

      {/* 受賞歴 */}
      <FormSection title="受賞歴" onAdd={awardHelpers.add}>
        {awards.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            受賞歴を追加してください
          </div>
        ) : (
          <div className="space-y-3">
            {awards.map((award, index) => (
              <FormCard
                key={index}
                compact
                onRemove={() => awardHelpers.remove(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      label="受賞年"
                      name={`award-${index}-date`}
                      value={award.date}
                      onChange={(e) =>
                        awardHelpers.update(index, "date", e.target.value)
                      }
                      placeholder="2022"
                      required
                    />

                    <FormField
                      label="賞の名称"
                      name={`award-${index}-title`}
                      value={award.title}
                      onChange={(e) =>
                        awardHelpers.update(index, "title", e.target.value)
                      }
                      required
                    />

                    <FormField
                      label="授与組織"
                      name={`award-${index}-organization`}
                      value={award.organization}
                      onChange={(e) =>
                        awardHelpers.update(
                          index,
                          "organization",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </FormCard>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
}
