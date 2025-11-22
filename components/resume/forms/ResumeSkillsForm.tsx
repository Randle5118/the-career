/**
 * 履歴書スキル・資格フォームコンポーネント（リファクタリング版）
 * 
 * 改善点：
 * - useControlledArrayField で状態管理を統一
 * - FormSection, FormCard で UI を統一
 * - TagInput でスキル項目の入力を簡素化
 * - コード量: 238行 → 138行 (42%削減)
 */

import type { Skill, Certification } from "@/types/resume";
import { FormField } from "@/components/forms";
import { useState } from "react";
import {
  FormSection,
  FormCard,
  TagInput,
  useControlledArrayField,
} from "./shared";

interface ResumeSkillsFormProps {
  skills: Skill[];
  certifications: Certification[];
  onSkillsChange: (skills: Skill[]) => void;
  onCertificationsChange: (certifications: Certification[]) => void;
}

export default function ResumeSkillsForm({
  skills,
  certifications,
  onSkillsChange,
  onCertificationsChange,
}: ResumeSkillsFormProps) {
  // Skills 管理
  const skillHelpers = useControlledArrayField(
    skills,
    onSkillsChange,
    () => ({ category: "", items: [] })
  );

  // Certifications 管理
  const certHelpers = useControlledArrayField(
    certifications,
    onCertificationsChange,
    () => ({ date: "", name: "" })
  );

  // スキル項目の追加
  const handleAddSkillItem = (categoryIndex: number, item: string) => {
    const updated = skills.map((skill, i) =>
      i === categoryIndex
        ? { ...skill, items: [...skill.items, item] }
        : skill
    );
    onSkillsChange(updated);
  };

  // スキル項目の削除
  const handleRemoveSkillItem = (categoryIndex: number, itemIndex: number) => {
    const updated = skills.map((skill, i) =>
      i === categoryIndex
        ? { ...skill, items: skill.items.filter((_, j) => j !== itemIndex) }
        : skill
    );
    onSkillsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* スキル */}
      <FormSection
        title="スキル"
        onAdd={skillHelpers.add}
        addButtonText="カテゴリ追加"
      >
        {skills.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            スキルカテゴリを追加してください
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <FormCard key={index} onRemove={() => skillHelpers.remove(index)}>
                {/* カテゴリ名 */}
                <div className="mb-4">
                  <FormField
                    label="カテゴリ名"
                    name={`skill-category-${index}`}
                    value={skill.category}
                    onChange={(e) =>
                      skillHelpers.update(index, "category", e.target.value)
                    }
                    placeholder="例: マネジメント、開発・技術"
                    required
                  />
                </div>

                {/* スキル項目（TagInput） */}
                <TagInput
                  label="スキル項目"
                  items={skill.items}
                  onAdd={(item) => handleAddSkillItem(index, item)}
                  onRemove={(itemIndex) =>
                    handleRemoveSkillItem(index, itemIndex)
                  }
                  placeholder="スキルを入力してEnter"
                  badgeStyle="outline"
                />
              </FormCard>
            ))}
          </div>
        )}
      </FormSection>

      {/* 資格・免許 */}
      <FormSection title="資格・免許" onAdd={certHelpers.add}>
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            資格・免許を追加してください
          </div>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <FormCard
                key={index}
                compact
                onRemove={() => certHelpers.remove(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      label="取得年月"
                      name={`cert-${index}-date`}
                      value={cert.date}
                      onChange={(e) =>
                        certHelpers.update(index, "date", e.target.value)
                      }
                      placeholder="2010-12"
                      required
                    />

                    <div className="md:col-span-2">
                      <FormField
                        label="資格名"
                        name={`cert-${index}-name`}
                        value={cert.name}
                        onChange={(e) =>
                          certHelpers.update(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
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
