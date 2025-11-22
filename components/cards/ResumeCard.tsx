/**
 * Resume Card Component
 * 
 * 履歴書のカード表示コンポーネント
 * 用途：履歴書一覧で使用
 */

import { FileText, Edit, Archive, Trash2, Star, Copy, Eye, Calendar, MessageSquare } from "lucide-react";
import type { Resume } from "@/types/resume";
import { formatDate } from "@/libs/utils/date";

interface ResumeCardProps {
  resume: Resume;
  onEdit: (resume: Resume) => void;
  onView: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  onArchive: (resume: Resume) => void;
  onDuplicate: (resume: Resume) => void;
  onSetPrimary: (resume: Resume) => void;
}

export default function ResumeCard({
  resume,
  onEdit,
  onView,
  onDelete,
  onArchive,
  onDuplicate,
  onSetPrimary,
}: ResumeCardProps) {
  const isExpired = resume.public_expires_at && new Date(resume.public_expires_at) < new Date();
  
  return (
    <div className="bg-white border border-base-300 rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base-content truncate">
                  {resume.resume_name || "無題の履歴書"}
                </h3>
                {resume.is_primary && (
                  <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" title="主要履歴書" />
                )}
              </div>
              
              <p className="text-sm text-base-content/60 truncate">
                {resume.name_kanji || "名前未設定"}
              </p>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            {resume.is_public && !isExpired && (
              <span className="badge badge-success badge-sm gap-1">
                <Eye className="w-3 h-3" />
                公開中
              </span>
            )}
            {isExpired && (
              <span className="badge badge-error badge-sm">
                期限切れ
              </span>
            )}
            {resume.is_archived && (
              <span className="badge badge-ghost badge-sm gap-1">
                <Archive className="w-3 h-3" />
                アーカイブ
              </span>
            )}
          </div>
        </div>
        
        {/* Internal Memo */}
        {resume.internal_memo && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-base-100 rounded text-sm">
            <MessageSquare className="w-4 h-4 text-base-content/40 flex-shrink-0 mt-0.5" />
            <p className="text-base-content/70 text-xs line-clamp-2">
              {resume.internal_memo}
            </p>
          </div>
        )}
        
        {/* Completeness Progress */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-base-content/60">完成度:</span>
          <div className="flex-1">
            <progress 
              className="progress progress-primary w-full h-2" 
              value={resume.completeness} 
              max="100"
            ></progress>
          </div>
          <span className="text-xs font-medium text-primary">
            {resume.completeness}%
          </span>
        </div>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-base-content/50">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(resume.updated_at)}
          </span>
          {resume.public_expires_at && !isExpired && (
            <span>
              期限: {formatDate(resume.public_expires_at)}
            </span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="border-t border-base-300 p-4 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => onView(resume)}
            className="btn btn-sm btn-ghost gap-1"
            title="プレビュー"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">表示</span>
          </button>
          <button
            onClick={() => onEdit(resume)}
            className="btn btn-sm btn-primary gap-1"
            title="編集"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">編集</span>
          </button>
        </div>
        
        {/* Dropdown Menu */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-lg w-52 border border-base-300">
            {!resume.is_primary && !resume.is_archived && (
              <li>
                <button onClick={() => onSetPrimary(resume)} className="gap-2">
                  <Star className="w-4 h-4" />
                  主要履歴書に設定
                </button>
              </li>
            )}
            <li>
              <button onClick={() => onDuplicate(resume)} className="gap-2">
                <Copy className="w-4 h-4" />
                複製
              </button>
            </li>
            <li>
              <button onClick={() => onArchive(resume)} className="gap-2">
                <Archive className="w-4 h-4" />
                {resume.is_archived ? 'アーカイブ解除' : 'アーカイブ'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onDelete(resume)} 
                className="gap-2 text-error"
                disabled={resume.is_primary}
              >
                <Trash2 className="w-4 h-4" />
                削除
                {resume.is_primary && <span className="text-xs">(主要履歴書)</span>}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

