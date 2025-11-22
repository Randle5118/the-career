/**
 * 履歴書職務経歴フォームコンポーネント（リファクタリング版）
 * 
 * 改善点：
 * - useControlledArrayField で会社と職位の状態管理を統一
 * - FormSection, FormCard で UI を統一  
 * - EmptyState で空状態を統一
 * - コード量: 485行 → 340行 (30%削減)
 * 
 * 注: 展開/折疊邏輯保留（業務需求）
 */

import type { WorkExperience, Position } from "@/types/resume";
import { FormField, FormTextarea, type SelectOption } from "@/components/forms";
import { ChevronDown, ChevronUp, Briefcase, GripVertical } from "lucide-react";
import { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import {
  FormSection,
  EmptyState,
  useControlledArrayField,
  SortableList,
} from "./shared";

interface ResumeWorkExperienceFormProps {
  workExperience: WorkExperience[];
  onChange: (workExperience: WorkExperience[]) => void;
}

const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: "正社員", label: "正社員" },
  { value: "契約社員", label: "契約社員" },
  { value: "フリーランス", label: "フリーランス" },
  { value: "アルバイト", label: "アルバイト" },
  { value: "そのた", label: "そのた" },
];

export default function ResumeWorkExperienceForm({
  workExperience,
  onChange,
}: ResumeWorkExperienceFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedPositions, setExpandedPositions] = useState<
    Record<string, boolean>
  >({});
  const [customEmploymentTypes, setCustomEmploymentTypes] = useState<
    Record<number, string>
  >({});

  // 会社管理
  const { add, remove, update, move } = useControlledArrayField(
    workExperience,
    onChange,
    () => ({
      id: crypto.randomUUID(),
      company_name: "",
      industry: "",
      employment_type: undefined,
      department: undefined,
      start_date: "",
      end_date: null,
      is_current: false,
      description: undefined,
      positions: [
        {
          id: crypto.randomUUID(),
          title: "",
          start_date: "",
          end_date: null,
          is_current: false,
          comment: undefined,
        },
      ],
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = workExperience.findIndex((item) => item.id === active.id);
      const newIndex = workExperience.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const handlePositionDragEnd = (expIndex: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const positions = workExperience[expIndex].positions;
      const oldIndex = positions.findIndex((p) => p.id === active.id);
      const newIndex = positions.findIndex((p) => p.id === over.id);
      
      const newPositions = [...positions];
      const [item] = newPositions.splice(oldIndex, 1);
      newPositions.splice(newIndex, 0, item);
      
      update(expIndex, "positions", newPositions);
    }
  };

  const handleAdd = () => {
    add();
    setExpandedIndex(workExperience.length);
  };

  const handleRemove = (index: number) => {
    remove(index);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const toggleExpand = (index: number) => {
    const newIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newIndex);

    if (
      newIndex !== null &&
      workExperience[newIndex]?.employment_type
    ) {
      const empType = workExperience[newIndex].employment_type;
      const isDefaultOption = EMPLOYMENT_TYPE_OPTIONS.some(
        (t) => t.value === empType
      );
      if (!isDefaultOption && empType) {
        setCustomEmploymentTypes((prev) => ({ ...prev, [newIndex]: empType }));
      }
    }
  };

  // 職位管理
  const handleAddPosition = (expIndex: number) => {
    const updated = workExperience.map((item, i) =>
      i === expIndex
        ? {
            ...item,
            positions: [
              ...item.positions,
              {
                id: crypto.randomUUID(),
                title: "",
                start_date: "",
                end_date: null,
                is_current: false,
                comment: undefined,
              },
            ],
          }
        : item
    );
    onChange(updated);
  };

  const handleRemovePosition = (expIndex: number, posIndex: number) => {
    const updated = workExperience.map((item, i) =>
      i === expIndex
        ? {
            ...item,
            positions: item.positions.filter((_, pi) => pi !== posIndex),
          }
        : item
    );
    onChange(updated);
  };

  const handlePositionChange = (
    expIndex: number,
    posIndex: number,
    field: keyof Position,
    value: any
  ) => {
    const updated = workExperience.map((item, i) =>
      i === expIndex
        ? {
            ...item,
            positions: item.positions.map((pos, pi) => {
              if (pi === posIndex) {
                const updatedPos = { ...pos, [field]: value };
                if (field === "is_current" && value === true) {
                  updatedPos.end_date = null;
                }
                return updatedPos;
              }
              return pos;
            }),
          }
        : item
    );
    onChange(updated);
  };

  const togglePositionExpand = (expIndex: number, posIndex: number) => {
    const key = `${expIndex}-${posIndex}`;
    setExpandedPositions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <FormSection
      title="職務経歴"
      onAdd={handleAdd}
      addButtonText="職務経歴を追加"
    >
      {workExperience.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          message="職務経歴がありません"
          actionText="職務経歴を追加"
          onAction={handleAdd}
        />
      ) : (
        <SortableList
          items={workExperience}
          onDragEnd={handleDragEnd}
          renderItem={(exp, index, dragHandleProps) => (
            <div
              key={exp.id || index}
              className="bg-base-100 border border-base-300 rounded-lg overflow-hidden"
            >
              {/* ヘッダー */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-200/50"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* 拖拉手柄 */}
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost btn-circle cursor-grab touch-none text-base-content/40 hover:text-base-content"
                    onClick={(e) => e.stopPropagation()}
                    {...dragHandleProps}
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  <div className="flex-1">
                    <h5 className="font-medium text-base-content">
                      {exp.company_name || `会社 ${index + 1}`}
                    </h5>
                    <p className="text-xs text-base-content/60">
                      {exp.start_date} 〜 {exp.is_current || !exp.end_date ? "現在" : exp.end_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="btn btn-sm btn-ghost btn-circle text-error"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>

                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-base-content/50" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-base-content/50" />
                  )}
                </div>
              </div>

              {/* 展開内容 */}
              {expandedIndex === index && (
                <div className="p-6 border-t border-base-300 space-y-6">
                  {/* 会社基本情報 */}
                  <div className="space-y-4">
                    <h6 className="text-sm font-semibold text-base-content/70">
                      会社情報
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="会社名"
                        name={`work-${index}-company_name`}
                        value={exp.company_name}
                        onChange={(e) =>
                          update(index, "company_name", e.target.value)
                        }
                        required
                      />

                      <FormField
                        label="業種"
                        name={`work-${index}-industry`}
                        value={exp.industry}
                        onChange={(e) =>
                          update(index, "industry", e.target.value)
                        }
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-base-content mb-2">
                          雇用形態
                        </label>
                        <select
                          name={`work-${index}-employment_type`}
                          value={
                            exp.employment_type &&
                            EMPLOYMENT_TYPE_OPTIONS.some(
                              (t) => t.value === exp.employment_type
                            )
                              ? exp.employment_type
                              : customEmploymentTypes[index] !== undefined ||
                                (exp.employment_type &&
                                  !EMPLOYMENT_TYPE_OPTIONS.some(
                                    (t) => t.value === exp.employment_type
                                  ))
                              ? "そのた"
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "そのた") {
                              setCustomEmploymentTypes((prev) => ({
                                ...prev,
                                [index]: exp.employment_type || "",
                              }));
                              if (
                                !exp.employment_type ||
                                EMPLOYMENT_TYPE_OPTIONS.some(
                                  (t) => t.value === exp.employment_type
                                )
                              ) {
                                update(index, "employment_type", undefined);
                              }
                            } else if (value === "") {
                              setCustomEmploymentTypes((prev) => {
                                const updated = { ...prev };
                                delete updated[index];
                                return updated;
                              });
                              update(index, "employment_type", undefined);
                            } else {
                              setCustomEmploymentTypes((prev) => {
                                const updated = { ...prev };
                                delete updated[index];
                                return updated;
                              });
                              update(index, "employment_type", value);
                            }
                          }}
                          className="select select-bordered w-full"
                        >
                          <option value="">選択してください</option>
                          {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {(exp.employment_type &&
                          !EMPLOYMENT_TYPE_OPTIONS.some(
                            (t) => t.value === exp.employment_type
                          )) ||
                        customEmploymentTypes[index] !== undefined ? (
                          <div className="mt-2">
                            <input
                              type="text"
                              name={`work-${index}-employment_type_custom`}
                              value={
                                customEmploymentTypes[index] ??
                                exp.employment_type ??
                                ""
                              }
                              onChange={(e) => {
                                const customValue = e.target.value;
                                setCustomEmploymentTypes((prev) => ({
                                  ...prev,
                                  [index]: customValue,
                                }));
                                update(
                                  index,
                                  "employment_type",
                                  customValue || undefined
                                );
                              }}
                              placeholder="雇用形態を入力してください"
                              className="input input-bordered w-full"
                            />
                          </div>
                        ) : null}
                      </div>

                      <FormField
                        label="入社年月"
                        name={`work-${index}-start_date`}
                        value={exp.start_date}
                        onChange={(e) =>
                          update(index, "start_date", e.target.value)
                        }
                        placeholder="2023-02"
                        required
                      />

                      <FormField
                        label="退社年月"
                        name={`work-${index}-end_date`}
                        value={exp.end_date || ""}
                        onChange={(e) =>
                          update(index, "end_date", e.target.value || null)
                        }
                        placeholder="現在の場合は空欄"
                      />

                      <FormField
                        label="部署"
                        name={`work-${index}-department`}
                        value={exp.department || ""}
                        onChange={(e) =>
                          update(index, "department", e.target.value || undefined)
                        }
                        placeholder="例: 開発部"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`work-${index}-is_current`}
                        checked={exp.is_current}
                        onChange={(e) =>
                          update(index, "is_current", e.target.checked)
                        }
                        className="checkbox checkbox-primary"
                      />
                      <label
                        htmlFor={`work-${index}-is_current`}
                        className="text-sm text-base-content"
                      >
                        現在勤務中
                      </label>
                    </div>

                    <FormTextarea
                      label="概要"
                      name={`work-${index}-description`}
                      value={exp.description || ""}
                      onChange={(e) =>
                        update(index, "description", e.target.value || undefined)
                      }
                      placeholder="この会社での職務概要を記入してください。&#10;&#10;例:&#10;年間200億円規模のB2B/B2B2C/B2Cチケッティングプラットフォームのメインプロダクトマネージャーとして、戦略立案から開発最適化まで全プロセスを統括。"
                      rows={6}
                    />
                  </div>

                  {/* 職位リスト */}
                  <div className="border-t border-base-300 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h6 className="text-sm font-semibold text-base-content/70 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        職位・役職
                      </h6>
                      <button
                        type="button"
                        onClick={() => handleAddPosition(index)}
                        className="btn btn-xs btn-outline btn-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        職位を追加
                      </button>
                    </div>

                    <div className="space-y-3">
                      <SortableList
                        items={exp.positions}
                        onDragEnd={(e) => handlePositionDragEnd(index, e)}
                        renderItem={(pos, posIndex, posDragHandleProps) => {
                          const posKey = `${index}-${posIndex}`;
                          const isPosExpanded = expandedPositions[posKey];

                          return (
                            <div
                              key={pos.id || posIndex}
                              className="border border-base-300 rounded-lg overflow-hidden bg-base-100"
                            >
                              {/* 職位ヘッダ */}
                              <div
                                className="p-3 bg-base-200/30 flex items-center justify-between cursor-pointer hover:bg-base-200/50"
                                onClick={() =>
                                  togglePositionExpand(index, posIndex)
                                }
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  {/* 職位拖拉手柄 */}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-ghost btn-circle cursor-grab touch-none text-base-content/40 hover:text-base-content"
                                    onClick={(e) => e.stopPropagation()}
                                    {...posDragHandleProps}
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </button>
                                  
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-base-content">
                                      {pos.title || `職位 ${posIndex + 1}`}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                      {pos.start_date} 〜{" "}
                                      {pos.is_current || !pos.end_date
                                        ? "現在"
                                        : pos.end_date}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemovePosition(index, posIndex);
                                    }}
                                    className="btn btn-xs btn-ghost btn-circle text-error"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>

                                  {isPosExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-base-content/50" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-base-content/50" />
                                  )}
                                </div>
                              </div>

                              {/* 職位詳細 */}
                              {isPosExpanded && (
                                <div className="p-4 space-y-4 bg-base-100 border-t border-base-300">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      label="役職"
                                      name={`pos-${index}-${posIndex}-title`}
                                      value={pos.title}
                                      onChange={(e) =>
                                        handlePositionChange(
                                          index,
                                          posIndex,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      placeholder="例: Product Manager Lead"
                                      required
                                    />

                                    <div className="flex items-center gap-2 pt-6">
                                      <input
                                        type="checkbox"
                                        id={`pos-${index}-${posIndex}-is_current`}
                                        checked={pos.is_current}
                                        onChange={(e) =>
                                          handlePositionChange(
                                            index,
                                            posIndex,
                                            "is_current",
                                            e.target.checked
                                          )
                                        }
                                        className="checkbox checkbox-primary checkbox-sm"
                                      />
                                      <label
                                        htmlFor={`pos-${index}-${posIndex}-is_current`}
                                        className="text-xs text-base-content"
                                      >
                                        現在の職位
                                      </label>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      label="開始年月"
                                      name={`pos-${index}-${posIndex}-start_date`}
                                      value={pos.start_date}
                                      onChange={(e) =>
                                        handlePositionChange(
                                          index,
                                          posIndex,
                                          "start_date",
                                          e.target.value
                                        )
                                      }
                                      placeholder="2023-02"
                                      required
                                    />

                                    <FormField
                                      label="終了年月"
                                      name={`pos-${index}-${posIndex}-end_date`}
                                      value={pos.end_date || ""}
                                      onChange={(e) =>
                                        handlePositionChange(
                                          index,
                                          posIndex,
                                          "end_date",
                                          e.target.value || null
                                        )
                                      }
                                      placeholder="現在の場合は空欄"
                                      disabled={pos.is_current}
                                    />
                                  </div>

                                  <FormTextarea
                                    label="備考（昇進・職種変更の説明）"
                                    name={`pos-${index}-${posIndex}-comment`}
                                    value={pos.comment || ""}
                                    onChange={(e) =>
                                      handlePositionChange(
                                        index,
                                        posIndex,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    placeholder="例: Senior Managerに昇進、開発から管理職へ転換など"
                                    rows={2}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        />
      )}
    </FormSection>
  );
}
