"use client";

import React, { useState } from "react";
import { 
  FormRenderer, 
  createFormConfig, 
  createFieldConfig, 
  createTabConfig 
} from "@/components/forms";

export default function FormSystemDemo() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 無 Tab 版本的簡單表單配置
  const simpleFormConfig = createFormConfig("simple-form", "single", {
    title: "シンプルフォーム",
    description: "Tab なしのシンプルなフォーム例",
    spacing: "comfortable",
    fields: [
      createFieldConfig("name", "text", "名前", "name", {
        placeholder: "お名前を入力してください",
        required: true,
      }),
      createFieldConfig("email", "email", "メールアドレス", "email", {
        placeholder: "example@email.com",
        required: true,
      }),
      createFieldConfig("age", "number", "年齢", "age", {
        placeholder: "年齢を入力してください",
        min: 0,
        max: 120,
      }),
      createFieldConfig("country", "select", "国", "country", {
        options: [
          { value: "jp", label: "日本" },
          { value: "us", label: "アメリカ" },
          { value: "uk", label: "イギリス" },
        ],
      }),
      createFieldConfig("bio", "textarea", "自己紹介", "bio", {
        placeholder: "簡単な自己紹介を入力してください",
        rows: 4,
      }),
      createFieldConfig("skills", "tags", "スキル", "skills", {
        placeholder: "スキルを入力して Enter キーを押す",
      }),
    ],
  });

  // Tab 版本的複雜表單配置
  const tabbedFormConfig = createFormConfig("tabbed-form", "tabs", {
    title: "タブ付きフォーム",
    description: "複数のタブに分かれたフォーム例",
    spacing: "spacious",
    tabs: [
      createTabConfig(
        "personal",
        "個人情報",
        [
          createFieldConfig("firstName", "text", "名", "firstName", {
            required: true,
          }),
          createFieldConfig("lastName", "text", "姓", "lastName", {
            required: true,
          }),
          createFieldConfig("birthDate", "date", "生年月日", "birthDate"),
          createFieldConfig("phone", "text", "電話番号", "phone", {
            placeholder: "090-1234-5678",
          }),
        ],
        "基本的な個人情報を入力してください"
      ),
      
      createTabConfig(
        "address",
        "住所情報",
        [
          createFieldConfig("postalCode", "text", "郵便番号", "postalCode", {
            placeholder: "123-4567",
          }),
          createFieldConfig("prefecture", "select", "都道府県", "prefecture", {
            options: [
              { value: "tokyo", label: "東京都" },
              { value: "osaka", label: "大阪府" },
              { value: "kyoto", label: "京都府" },
            ],
          }),
          createFieldConfig("city", "text", "市区町村", "city"),
          createFieldConfig("address", "textarea", "住所", "address", {
            rows: 2,
          }),
        ],
        "住所に関する情報を入力してください"
      ),
      
      createTabConfig(
        "preferences",
        "設定",
        [
          createFieldConfig("newsletter", "select", "メルマガ配信", "newsletter", {
            options: [
              { value: "yes", label: "配信希望" },
              { value: "no", label: "配信不要" },
            ],
          }),
          createFieldConfig("language", "select", "言語", "language", {
            options: [
              { value: "ja", label: "日本語" },
              { value: "en", label: "English" },
            ],
          }),
          createFieldConfig("notifications", "tags", "通知設定", "notifications", {
            placeholder: "通知したい項目を入力",
          }),
        ],
        "アプリケーションの設定をカスタマイズしてください"
      ),
    ],
  });

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 清除錯誤
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("フォームが送信されました！");
  };

  const handleCancel = () => {
    setFormData({});
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        
        {/* 無 Tab 版本示例 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <FormRenderer
            config={simpleFormConfig}
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>

        {/* Tab 版本示例 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <FormRenderer
            config={tabbedFormConfig}
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>

        {/* 當前表單數據顯示 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            現在のフォームデータ
          </h3>
          <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
