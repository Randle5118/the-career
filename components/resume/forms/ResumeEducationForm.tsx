/**
 * 履歴書学歴フォームコンポーネント（リファクタリング版）
 * 
 * 改善点：
 * - useControlledArrayField で状態管理を統一
 * - FormSection, FormCard, EmptyState を使用
 * - コード量: 124行 → 60行 (50%削減)
 */

import type { Education } from "@/types/resume";
import { FormField, FormTextarea } from "@/components/forms";
import { GraduationCap } from "lucide-react";
import { DragEndEvent } from "@dnd-kit/core";
import {
  FormSection,
  FormCard,
  EmptyState,
  useControlledArrayField,
  SortableList,
} from "./shared";

interface ResumeEducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export default function ResumeEducationForm({
  education,
  onChange,
}: ResumeEducationFormProps) {
  // 使用統一的陣列管理 Hook
  const { add, remove, update, move } = useControlledArrayField(
    education,
    onChange,
    () => ({
      id: crypto.randomUUID(),
      date: "",
      school_name: "",
      major: "",
      comment: "",
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = education.findIndex((item) => item.id === active.id);
      const newIndex = education.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <FormSection title="学歴" onAdd={add} addButtonText="学歴を追加">
      {education.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          message="学歴がありません"
          actionText="学歴を追加"
          onAction={add}
        />
      ) : (
        <SortableList
          items={education}
          onDragEnd={handleDragEnd}
          renderItem={(edu, index, dragHandleProps) => (
            <FormCard
              key={edu.id || index}
              title={`学歴 ${index + 1}`}
              onRemove={() => remove(index)}
              dragHandleProps={dragHandleProps}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="卒業年月"
                    name={`education-${index}-date`}
                    value={edu.date}
                    onChange={(e) => update(index, "date", e.target.value)}
                    placeholder="2011-06"
                    required
                  />

                  <FormField
                    label="学校名"
                    name={`education-${index}-school_name`}
                    value={edu.school_name}
                    onChange={(e) => update(index, "school_name", e.target.value)}
                    required
                  />

                  <FormField
                    label="学科・専攻"
                    name={`education-${index}-major`}
                    value={edu.major}
                    onChange={(e) => update(index, "major", e.target.value)}
                    required
                  />
                </div>

                {/* 備考欄位 */}
                <FormTextarea
                  label="備考"
                  name={`education-${index}-comment`}
                  value={edu.comment || ""}
                  onChange={(e) => update(index, "comment", e.target.value)}
                  placeholder="例: 学部長表彰、交換留学経験など"
                  rows={3}
                />
              </div>
            </FormCard>
          )}
        />
      )}
    </FormSection>
  );
}
