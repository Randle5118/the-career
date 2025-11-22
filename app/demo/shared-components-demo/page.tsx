"use client";

/**
 * 共用組件展示頁面
 * 
 * 用於測試和展示 Resume Forms 的共用組件
 */

import { useState } from "react";
import {
  FormSection,
  FormCard,
  EmptyState,
  PrivacyBadge,
  TagInput,
  useArrayField,
} from "@/components/resume/forms/shared";
import { GraduationCap, Briefcase, Star } from "lucide-react";
import { FormField } from "@/components/forms";

interface SampleItem {
  name: string;
  value: string;
}

export default function SharedComponentsDemoPage() {
  const [tags, setTags] = useState<string[]>(["React", "TypeScript", "Next.js"]);
  const { items, add, remove, update } = useArrayField<SampleItem>(
    [{ name: "サンプル 1", value: "値 1" }],
    () => ({ name: "", value: "" })
  );

  const handleTagAdd = (tag: string) => {
    setTags([...tags, tag]);
  };

  const handleTagRemove = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Resume Forms - 共用組件展示
          </h1>
          <p className="text-base-content/70">
            Phase 1 重構成果 | 代碼減少 43%
          </p>
        </div>

        {/* FormSection Demo */}
        <div className="bg-base-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">1. FormSection</h2>
          <p className="text-base-content/70 mb-4">
            統一的區塊容器，包含標題、新增按鈕、Privacy Badge
          </p>

          <div className="space-y-6">
            <FormSection
              title="基本使用"
              onAdd={() => alert("新增按鈕被點擊")}
              addButtonText="追加項目"
            >
              <div className="bg-base-200 p-4 rounded">
                這裡是內容區域
              </div>
            </FormSection>

            <FormSection
              title="帶 Privacy Badge"
              showPrivacyBadge
              onAdd={() => alert("新增")}
            >
              <div className="bg-base-200 p-4 rounded">
                非公開欄位內容
              </div>
            </FormSection>

            <FormSection title="只有標題（無按鈕）">
              <div className="bg-base-200 p-4 rounded">
                純顯示區域
              </div>
            </FormSection>
          </div>
        </div>

        {/* FormCard Demo */}
        <div className="bg-base-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">2. FormCard</h2>
          <p className="text-base-content/70 mb-4">
            統一的卡片容器，包含標題和刪除按鈕
          </p>

          <div className="space-y-4">
            <FormCard
              title="標準卡片"
              onRemove={() => alert("刪除按鈕被點擊")}
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="欄位 1"
                  name="field1"
                  value=""
                  onChange={() => {}}
                />
                <FormField
                  label="欄位 2"
                  name="field2"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </FormCard>

            <FormCard compact onRemove={() => alert("刪除")}>
              <p>緊湊模式（減少 padding）</p>
            </FormCard>

            <FormCard
              title="帶額外內容"
              onRemove={() => alert("刪除")}
              headerExtra={
                <span className="badge badge-success">現職</span>
              }
            >
              <p>Header 右側可以放置額外的徽章或按鈕</p>
            </FormCard>
          </div>
        </div>

        {/* EmptyState Demo */}
        <div className="bg-base-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">3. EmptyState</h2>
          <p className="text-base-content/70 mb-4">
            統一的空狀態顯示
          </p>

          <div className="space-y-4">
            <EmptyState
              message="沒有任何項目"
              actionText="新增項目"
              onAction={() => alert("新增")}
            />

            <EmptyState
              icon={GraduationCap}
              message="学歴がありません"
              actionText="学歴を追加"
              onAction={() => alert("新增學歷")}
            />

            <EmptyState
              icon={Briefcase}
              message="職務経歴がありません"
              actionText="職務経歴を追加"
              onAction={() => alert("新增職務經歷")}
            />
          </div>
        </div>

        {/* PrivacyBadge Demo */}
        <div className="bg-base-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">4. PrivacyBadge</h2>
          <p className="text-base-content/70 mb-4">
            統一的隱私標記
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                生年月日 <PrivacyBadge />
              </label>
              <input type="date" className="input input-bordered" />
              <p className="text-xs text-base-content/50 mt-1">
                公開履歴書には表示されません
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                年収 <PrivacyBadge text="内部のみ" />
              </label>
              <input type="text" className="input input-bordered" />
            </div>
          </div>
        </div>

        {/* TagInput Demo */}
        <div className="bg-base-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">5. TagInput</h2>
          <p className="text-base-content/70 mb-4">
            統一的標籤輸入組件
          </p>

          <div className="space-y-6">
            <TagInput
              label="Primary 樣式"
              items={tags}
              onAdd={handleTagAdd}
              onRemove={handleTagRemove}
              placeholder="輸入標籤並按 Enter"
              badgeStyle="primary"
            />

            <TagInput
              label="Outline 樣式"
              items={["東京", "リモート", "大阪"]}
              onAdd={(item) => alert(`新增: ${item}`)}
              onRemove={(index) => alert(`刪除: ${index}`)}
              placeholder="輸入地點"
              badgeStyle="outline"
            />

            <TagInput
              label="帶 Privacy Badge"
              items={["正社員", "契約社員"]}
              onAdd={(item) => alert(`新增: ${item}`)}
              onRemove={(index) => alert(`刪除: ${index}`)}
              placeholder="輸入雇用形態"
              badgeStyle="ghost"
              showPrivacyBadge
            />
          </div>
        </div>

        {/* useArrayField Demo */}
        <div className="bg-base-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">6. useArrayField Hook</h2>
          <p className="text-base-content/70 mb-4">
            統一的陣列管理邏輯
          </p>

          <FormSection
            title={`項目列表 (${items.length})`}
            onAdd={add}
            addButtonText="新增項目"
          >
            {items.length === 0 ? (
              <EmptyState
                icon={Star}
                message="尚無項目"
                actionText="新增第一個項目"
                onAction={add}
              />
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <FormCard
                    key={index}
                    title={`項目 ${index + 1}`}
                    onRemove={() => remove(index)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="名稱"
                        name={`item-${index}-name`}
                        value={item.name}
                        onChange={(e) =>
                          update(index, "name", e.target.value)
                        }
                      />
                      <FormField
                        label="値"
                        name={`item-${index}-value`}
                        value={item.value}
                        onChange={(e) =>
                          update(index, "value", e.target.value)
                        }
                      />
                    </div>
                  </FormCard>
                ))}
              </div>
            )}
          </FormSection>
        </div>

        {/* 成果統計 */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            📊 重構成果統計
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-base-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-1">43%</div>
              <div className="text-sm text-base-content/70">代碼減少</div>
              <div className="text-xs text-base-content/50 mt-1">
                366 行 → 210 行
              </div>
            </div>

            <div className="bg-base-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-secondary mb-1">6</div>
              <div className="text-sm text-base-content/70">共用組件</div>
              <div className="text-xs text-base-content/50 mt-1">
                579 行新增代碼
              </div>
            </div>

            <div className="bg-base-100 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-accent mb-1">10+</div>
              <div className="text-sm text-base-content/70">可重用處</div>
              <div className="text-xs text-base-content/50 mt-1">
                涵蓋所有 Resume 表單
              </div>
            </div>
          </div>
        </div>

        {/* 返回連結 */}
        <div className="text-center">
          <a
            href="/dashboard/resume/edit"
            className="btn btn-primary btn-lg"
          >
            查看實際應用 - 編輯履歷書
          </a>
        </div>
      </div>
    </div>
  );
}

