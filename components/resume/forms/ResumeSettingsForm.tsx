/**
 * Resume Settings Form
 * 
 * 履歴書の設定フォーム
 * - 履歴書名
 * - 内部メモ
 * - 公開設定
 * - 公開期限
 */

import { useState } from "react";
import { FileText, Eye, EyeOff, Calendar, MessageSquare, Star } from "lucide-react";
import type { Resume } from "@/types/resume";
import { formatDate } from "@/libs/utils/date";

interface ResumeSettingsFormProps {
  resume: Resume;
  onChange: (field: string, value: any) => void;
}

export default function ResumeSettingsForm({
  resume,
  onChange,
}: ResumeSettingsFormProps) {
  const [showSlugHelper, setShowSlugHelper] = useState(false);
  
  // 公開URL のプレビュー
  const publicUrlPreview = resume.public_url_slug 
    ? `${window.location.origin}/r/${resume.public_url_slug}`
    : "";
  
  // 公開期限の状態チェック
  const isExpired = resume.public_expires_at && new Date(resume.public_expires_at) < new Date();
  
  return (
    <div className="space-y-6">
      {/* 基本設定 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-base-content">基本設定</h3>
        </div>
        
        <div className="space-y-4">
          {/* 履歴書名 */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              履歴書名 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="resume_name"
              value={resume.resume_name || ""}
              onChange={(e) => onChange('resume_name', e.target.value)}
              className="input input-bordered w-full"
              placeholder="例: スタートアップ向け、大企業向け"
              required
            />
            <p className="text-xs text-base-content/50 mt-1">
              履歴書一覧で表示される名前です（公開ページには表示されません）
            </p>
          </div>
          
          {/* 主要履歴書 */}
          {resume.is_primary && (
            <div className="alert alert-info">
              <Star className="w-5 h-5" />
              <span>これは主要履歴書です</span>
            </div>
          )}
          
          {/* 内部メモ */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              内部メモ
              <span className="badge badge-ghost badge-xs ml-2">非公開</span>
            </label>
            <textarea
              name="internal_memo"
              value={resume.internal_memo || ""}
              onChange={(e) => onChange('internal_memo', e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={4}
              placeholder="例: このバージョンは技術職向けにカスタマイズ&#10;スキルセクションを強調&#10;次回更新時に英語力を追加予定"
            />
            <p className="text-xs text-base-content/50 mt-1">
              自分用のメモです。用途や編集メモ、TODO などを記録できます。
            </p>
          </div>
        </div>
      </div>
      
      {/* 公開設定 */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          {resume.is_public ? (
            <Eye className="w-5 h-5 text-success" />
          ) : (
            <EyeOff className="w-5 h-5 text-base-content/40" />
          )}
          <h3 className="text-lg font-semibold text-base-content">公開設定</h3>
          {resume.is_public && !isExpired && (
            <span className="badge badge-success badge-sm">公開中</span>
          )}
          {isExpired && (
            <span className="badge badge-error badge-sm">期限切れ</span>
          )}
        </div>
        
        <div className="space-y-4">
          {/* 公開/非公開 トグル */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={resume.is_public}
                onChange={(e) => onChange('is_public', e.target.checked)}
              />
              <div>
                <span className="label-text font-medium">
                  {resume.is_public ? '公開する' : '非公開'}
                </span>
                <p className="text-xs text-base-content/50 mt-1">
                  {resume.is_public 
                    ? '企業や採用担当者とURLを共有できます' 
                    : '自分だけが閲覧できます'}
                </p>
              </div>
            </label>
          </div>
          
          {/* 公開URL設定 */}
          {resume.is_public && (
            <>
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  公開URL
                  <button
                    type="button"
                    onClick={() => setShowSlugHelper(!showSlugHelper)}
                    className="btn btn-xs btn-ghost ml-2"
                  >
                    ?
                  </button>
                </label>
                
                {showSlugHelper && (
                  <div className="alert alert-info mb-3 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <p>半角英数字とハイフンのみ使用可能</p>
                      <p>例: tanaka-taro、engineer-2024</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <span className="input input-bordered flex items-center text-base-content/50 text-sm">
                    {window.location.origin}/r/
                  </span>
                  <input
                    type="text"
                    name="public_url_slug"
                    value={resume.public_url_slug || ""}
                    onChange={(e) => onChange('public_url_slug', e.target.value.toLowerCase())}
                    className="input input-bordered flex-1"
                    placeholder="your-unique-url"
                    pattern="[a-z0-9-]+"
                  />
                </div>
                
                {resume.public_url_slug && (
                  <div className="mt-2 p-3 bg-base-200 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">プレビュー:</p>
                    <a 
                      href={publicUrlPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary text-sm break-all"
                    >
                      {publicUrlPreview}
                    </a>
                  </div>
                )}
              </div>
              
              {/* 公開期限 */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  公開期限（オプション）
                </label>
                <input
                  type="date"
                  name="public_expires_at"
                  value={resume.public_expires_at ? resume.public_expires_at.split('T')[0] : ""}
                  onChange={(e) => onChange('public_expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="input input-bordered w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-base-content/50 mt-1">
                  設定した日時を過ぎると自動的に非公開になります
                </p>
                
                {isExpired && (
                  <div className="alert alert-warning mt-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>公開期限が過ぎています。新しい期限を設定してください。</span>
                  </div>
                )}
              </div>
              
              {/* 統計情報（将来の機能） */}
              <div className="border-t border-base-300 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-base-content/60" />
                  <span className="text-sm font-medium text-base-content/60">公開情報</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-base-content/50">公開開始</p>
                    <p className="text-base-content font-medium">
                      {resume.created_at ? formatDate(resume.created_at) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-base-content/50">最終更新</p>
                    <p className="text-base-content font-medium">
                      {resume.updated_at ? formatDate(resume.updated_at) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* 非公開時のメッセージ */}
          {!resume.is_public && (
            <div className="alert">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm">
                <p>この履歴書は現在非公開です</p>
                <p className="text-xs text-base-content/50">公開するには上のトグルをオンにしてください</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* バージョン情報 */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-base-content/60" />
          <span className="text-sm font-medium text-base-content/60">バージョン情報</span>
        </div>
        <div className="text-xs text-base-content/50 space-y-1">
          <p>履歴書 ID: {resume.id}</p>
          <p>作成日: {resume.created_at ? formatDate(resume.created_at) : '-'}</p>
          <p>最終更新: {resume.updated_at ? formatDate(resume.updated_at) : '-'}</p>
          {resume.version && <p>バージョン: {resume.version}</p>}
        </div>
      </div>
    </div>
  );
}

