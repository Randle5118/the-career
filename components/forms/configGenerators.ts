import { FormConfig, FormFieldConfig, FormTabConfig } from "./types";

// 預定義的字段配置生成器
export const createFieldConfig = (
  id: string,
  type: FormFieldConfig["type"],
  label: string,
  name: string,
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  id,
  type,
  label,
  name,
  ...options,
});

// 預定義的 Tab 配置生成器
export const createTabConfig = (
  id: string,
  label: string,
  fields: FormFieldConfig[],
  description?: string
): FormTabConfig => ({
  id,
  label,
  fields,
  description,
});

// 預定義的表單配置生成器
export const createFormConfig = (
  id: string,
  layout: "tabs" | "single",
  options: Partial<FormConfig> = {}
): FormConfig => ({
  id,
  layout,
  spacing: "comfortable",
  submitText: "保存",
  cancelText: "キャンセル",
  ...options,
});

// Application Modal 的配置
export const createApplicationFormConfig = (): FormConfig => {
  return createFormConfig("application-form", "tabs", {
    title: "応募情報",
    tabs: [
      createTabConfig(
        "basic",
        "基本情報",
        [
          createFieldConfig("company-name", "text", "会社名", "companyName", {
            placeholder: "例: 株式会社サンプル",
            required: true,
          }),
          createFieldConfig("company-url", "url", "会社URL", "companyUrl", {
            placeholder: "https://www.example.com",
          }),
          createFieldConfig("position", "text", "職種", "position", {
            placeholder: "例: フロントエンドエンジニア",
            required: true,
          }),
          createFieldConfig("status", "select", "ステータス", "status", {
            required: true,
            options: [
              { value: "bookmarked", label: "ブックマーク" },
              { value: "applied", label: "応募済み" },
              { value: "interview", label: "面談・面接" },
              { value: "offer", label: "内定" },
              { value: "rejected", label: "辞退・不採用" },
            ],
          }),
          createFieldConfig("employment-type", "select", "雇用形態", "employmentType", {
            options: [
              { value: "full_time", label: "正社員" },
              { value: "contract", label: "契約社員" },
              { value: "part_time", label: "パート・アルバイト" },
              { value: "intern", label: "インターン" },
              { value: "freelance", label: "フリーランス" },
            ],
          }),
        ]
      ),
      
      createTabConfig(
        "salary",
        "給与情報",
        [
          createFieldConfig("application-method", "custom", "応募方法", "applicationMethod", {
            customComponent: require("./ApplicationMethodInput").ApplicationMethodInput,
          }),
          createFieldConfig("posted-salary", "custom", "掲載給与", "postedSalary", {
            customComponent: require("./SalaryDetailsInput").SalaryDetailsInput,
          }),
          createFieldConfig("desired-salary", "number", "提示した希望給与（万円）", "desiredSalary", {
            placeholder: "例: 800",
            min: 0,
            step: 10,
          }),
          createFieldConfig("offer-salary", "custom", "オファー給与", "offerSalary", {
            customComponent: require("./SalaryDetailsInput").SalaryDetailsInput,
          }),
        ]
      ),
      
      createTabConfig(
        "other",
        "その他",
        [
          createFieldConfig("tags", "tags", "タグ", "tags", {
            placeholder: "例: リモート可, React",
          }),
          createFieldConfig("notes", "textarea", "備考", "notes", {
            placeholder: "応募に関するメモを入力...",
            rows: 4,
          }),
        ]
      ),
      
      createTabConfig(
        "schedule",
        "スケジュール",
        [
          createFieldConfig("next-event", "text", "次回イベント", "nextEvent", {
            placeholder: "例: 最終面接、書類提出",
          }),
          createFieldConfig("deadline", "datetime-local", "期日(時間)", "deadline"),
          createFieldConfig("interview-method", "custom", "面接方法", "interviewMethod", {
            customComponent: require("./InterviewMethodInput").InterviewMethodInput,
          }),
        ]
      ),
    ],
  });
};

// Career Modal 的配置
export const createCareerFormConfig = (): FormConfig => {
  return createFormConfig("career-form", "tabs", {
    title: "職歴情報",
    tabs: [
      createTabConfig(
        "basic",
        "基本情報",
        [
          createFieldConfig("company-name", "text", "会社名", "companyName", {
            placeholder: "例: 株式会社メルカリ",
            required: true,
          }),
          createFieldConfig("position", "text", "職種・ポジション", "position", {
            placeholder: "例: フロントエンドエンジニア",
            required: true,
          }),
          createFieldConfig("employment-type", "select", "雇用形態", "employmentType", {
            required: true,
            options: [
              { value: "full_time", label: "正社員" },
              { value: "contract", label: "契約社員" },
              { value: "temporary", label: "派遣社員" },
              { value: "part_time", label: "パート・アルバイト" },
              { value: "freelance", label: "フリーランス" },
              { value: "side_job", label: "副業" },
            ],
          }),
          createFieldConfig("status", "select", "ステータス", "status", {
            required: true,
            options: [
              { value: "current", label: "現職" },
              { value: "left", label: "退職" },
            ],
          }),
          createFieldConfig("date-range", "custom", "", "dateRange", {
            customComponent: require("./CareerDateRangeInput").CareerDateRangeInput,
          }),
          createFieldConfig("tags", "tags", "タグ", "tags", {
            placeholder: "例: React, TypeScript, フルリモート",
          }),
          createFieldConfig("notes", "textarea", "メモ", "notes", {
            placeholder: "職務内容や成果など",
            rows: 3,
          }),
        ]
      ),
      
      createTabConfig(
        "salary",
        "給与情報",
        [
          createFieldConfig("offer-salary", "custom", "オファー給与", "offerSalary", {
            customComponent: require("./OfferSalarySection").OfferSalarySection,
          }),
          createFieldConfig("salary-history", "custom", "給与履歴", "salaryHistory", {
            customComponent: require("./SalaryHistorySection").SalaryHistorySection,
          }),
        ]
      ),
    ],
  });
};
