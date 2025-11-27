import React from "react";
import { FormField, FormSelect, FormTextarea, type SelectOption } from "./index";
import type { ApplicationMethod } from "@/types/application";

interface ApplicationMethodInputProps {
  value: ApplicationMethod;
  onChange: (method: ApplicationMethod) => void;
  className?: string;
}

export const ApplicationMethodInput: React.FC<ApplicationMethodInputProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const methodTypeOptions: SelectOption[] = [
    { value: "job_site", label: "求人サイト" },
    { value: "referral", label: "紹介" },
    { value: "direct", label: "直接応募" },
  ];

  const handleTypeChange = (type: string) => {
    switch (type) {
      case "job_site":
        onChange({
          type: "job_site",
          siteName: "",
          siteUrl: "",
          scoutType: "direct",
          recruiterName: "",
          recruiterCompany: "",
          scoutName: "",
          scoutCompany: "",
          scoutEmail: "",
          memo: "",
        });
        break;
      case "referral":
        onChange({
          type: "referral",
          referrerName: "",
          personFrom: "",
          referrerEmail: "",
          siteUrl: "",
          memo: "",
        });
        break;
      case "direct":
        onChange({
          type: "direct",
          siteUrl: "",
          contactPerson: "",
          contactEmail: "",
          memo: "",
        });
        break;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <FormSelect
        label="応募方法タイプ"
        name="applicationMethodType"
        value={value.type ?? ""}
        onChange={(e) => handleTypeChange(e.target.value)}
        options={methodTypeOptions}
        required
      />

      {value.type === "job_site" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="求人サイト名"
              name="siteName"
              value={value.siteName ?? ""}
              onChange={(e) => onChange({
                ...value,
                siteName: e.target.value
              })}
              placeholder="例: リクナビ、マイナビ、Wantedly"
              required
            />
            <FormSelect
              label="スカウトタイプ"
              name="scoutType"
              value={value.scoutType ?? "direct"}
              onChange={(e) => onChange({
                ...value,
                scoutType: e.target.value as "direct" | "recruiter"
              })}
              options={[
                { value: "direct", label: "企業から直接" },
                { value: "recruiter", label: "リクルーター経由" }
              ]}
            />
          </div>

          <FormField
            label="求人サイトURL"
            name="siteUrl"
            type="url"
            value={value.siteUrl ?? ""}
            onChange={(e) => onChange({
              ...value,
              siteUrl: e.target.value
            })}
            placeholder="https://www.example.com/jobs/123"
            required
          />

          {/* Scout 詳細資訊 - 可選 */}
          <details className="group" open>
            <summary className="cursor-pointer text-sm font-medium text-base-content/70 hover:text-base-content py-2">
              スカウト詳細情報（任意）
            </summary>
            <div className="space-y-4 mt-4 pl-4 border-l-2 border-base-300">
              {value.scoutType === "recruiter" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="リクルーター名"
                    name="recruiterName"
                    value={value.recruiterName ?? ""}
                    onChange={(e) => onChange({
                      ...value,
                      recruiterName: e.target.value
                    })}
                    placeholder="例: 田中太郎"
                  />
                  <FormField
                    label="リクルート会社名"
                    name="recruiterCompany"
                    value={value.recruiterCompany ?? ""}
                    onChange={(e) => onChange({
                      ...value,
                      recruiterCompany: e.target.value
                    })}
                    placeholder="例: 株式会社リクルート"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="担当者名"
                  name="scoutName"
                  value={value.scoutName ?? ""}
                  onChange={(e) => onChange({
                    ...value,
                    scoutName: e.target.value
                  })}
                  placeholder="例: 採用担当 佐藤"
                />
                <FormField
                  label="連絡先メール"
                  name="scoutEmail"
                  type="email"
                  value={value.scoutEmail ?? ""}
                  onChange={(e) => onChange({
                    ...value,
                    scoutEmail: e.target.value
                  })}
                  placeholder="sato@example.com"
                />
              </div>
              <FormField
                label="会社名"
                name="scoutCompany"
                value={value.scoutCompany ?? ""}
                onChange={(e) => onChange({
                  ...value,
                  scoutCompany: e.target.value
                })}
                placeholder="例: 株式会社サンプル"
              />
            </div>
          </details>

          <FormTextarea
            label="メモ"
            name="memo"
            value={value.memo ?? ""}
            onChange={(e) => onChange({
              ...value,
              memo: e.target.value
            })}
            placeholder="例: リクルーター経由でスカウトされた"
            rows={3}
          />
        </div>
      )}

      {value.type === "referral" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="紹介者名"
              name="referrerName"
              value={value.referrerName ?? ""}
              onChange={(e) => onChange({
                ...value,
                referrerName: e.target.value
              })}
              placeholder="例: 田中太郎"
              required
            />
            <FormField
              label="紹介者との関係"
              name="personFrom"
              value={value.personFrom ?? ""}
              onChange={(e) => onChange({
                ...value,
                personFrom: e.target.value
              })}
              placeholder="例: 同僚、友人、先輩"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="紹介者メール"
              name="referrerEmail"
              type="email"
              value={value.referrerEmail ?? ""}
              onChange={(e) => onChange({
                ...value,
                referrerEmail: e.target.value
              })}
              placeholder="tanaka@example.com"
            />
            <FormField
              label="求人サイトURL"
              name="siteUrl"
              type="url"
              value={value.siteUrl ?? ""}
              onChange={(e) => onChange({
                ...value,
                siteUrl: e.target.value
              })}
              placeholder="https://www.example.com/careers"
            />
          </div>

          <FormTextarea
            label="メモ"
            name="memo"
            value={value.memo ?? ""}
            onChange={(e) => onChange({
              ...value,
              memo: e.target.value
            })}
            placeholder="例: 元同僚からの紹介、社風が良いらしい"
            rows={3}
          />
        </div>
      )}

      {value.type === "direct" && (
        <div className="space-y-4">
          <FormField
            label="応募サイトURL"
            name="siteUrl"
            type="url"
            value={value.siteUrl ?? ""}
            onChange={(e) => onChange({
              ...value,
              siteUrl: e.target.value
            })}
            placeholder="https://www.company.com/careers"
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="連絡先担当者"
              name="contactPerson"
              value={value.contactPerson ?? ""}
              onChange={(e) => onChange({
                ...value,
                contactPerson: e.target.value
              })}
              placeholder="例: 人事部 山田さん"
              required
            />
            <FormField
              label="連絡先メール"
              name="contactEmail"
              type="email"
              value={value.contactEmail ?? ""}
              onChange={(e) => onChange({
                ...value,
                contactEmail: e.target.value
              })}
              placeholder="yamada@company.com"
            />
          </div>

          <FormTextarea
            label="メモ"
            name="memo"
            value={value.memo ?? ""}
            onChange={(e) => onChange({
              ...value,
              memo: e.target.value
            })}
            placeholder="例: CEO直接連絡、ストックオプションあり"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};