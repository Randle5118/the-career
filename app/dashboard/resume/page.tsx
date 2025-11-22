"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResumes } from "@/libs/hooks/useResumes";
import { Heading } from "@/components/catalyst/heading";
import { FileText, Plus, Archive as ArchiveIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import ResumeCard from "@/components/cards/ResumeCard";
import type { Resume } from "@/types/resume";

export default function ResumePage() {
  const router = useRouter();
  const {
    activeResumes,
    archivedResumes,
    isLoading,
    isProcessing,
    createResume,
    deleteResume,
    archiveResume,
    unarchiveResume,
    setPrimaryResume,
    duplicateResume,
  } = useResumes();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newResumeName, setNewResumeName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Resume | null>(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState<Resume | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  
  // ハンドラー
  const handleCreate = async () => {
    if (!newResumeName.trim()) {
      toast.error("履歴書名を入力してください");
      return;
    }
    
    const newResume = await createResume(newResumeName.trim());
    if (newResume) {
      setShowCreateDialog(false);
      setNewResumeName("");
      // 編集ページに遷移
      router.push(`/dashboard/resume/edit?id=${newResume.id}`);
    }
  };
  
  const handleView = (resume: Resume) => {
    // Dashboard 內的履歴書預覽頁面
    router.push(`/dashboard/resume/${resume.id}`);
  };
  
  const handleEdit = (resume: Resume) => {
    router.push(`/dashboard/resume/edit?id=${resume.id}`);
  };
  
  const handleDelete = async (resume: Resume) => {
    setDeleteConfirm(resume);
  };
  
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteResume(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleArchive = async (resume: Resume) => {
    try {
      if (resume.is_archived) {
        await unarchiveResume(resume.id);
      } else {
        await archiveResume(resume.id);
      }
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleDuplicate = async (resume: Resume) => {
    // デフォルトの複製名を設定
    const defaultName = `${resume.resume_name} (コピー)`;
    setDuplicateName(defaultName);
    setDuplicateConfirm(resume);
  };
  
  const confirmDuplicate = async () => {
    if (!duplicateConfirm) return;
    
    try {
      // カスタム名があれば使用、なければデフォルト
      const customName = duplicateName.trim() || undefined;
      await duplicateResume(duplicateConfirm.id, customName);
      
      setDuplicateConfirm(null);
      setDuplicateName("");
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleSetPrimary = async (resume: Resume) => {
    await setPrimaryResume(resume.id);
  };
  
  // Loading状態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10 mb-8">
          <div>
            <Heading>履歴書</Heading>
            <p className="mt-2 text-base/6 text-base-content/50 sm:text-sm/6">
              複数の履歴書を管理し、用途に応じて使い分けましょう
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="btn btn-primary gap-2"
            disabled={isProcessing}
          >
            <Plus className="w-5 h-5" />
            新規作成
          </button>
        </div>
        
        {/* Empty State */}
        {activeResumes.length === 0 && archivedResumes.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
            <FileText className="w-20 h-20 text-base-content/20 mb-6" />
            <h3 className="text-2xl font-semibold mb-3 text-base-content">
              まだ履歴書がありません
            </h3>
            <p className="text-base-content/60 mb-8 text-center max-w-md">
              履歴書を作成して、あなたのキャリアをアピールしましょう。<br />
              複数の履歴書を作成して、用途に応じて使い分けることができます。
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="btn btn-primary btn-lg gap-2"
            >
              <Plus className="w-5 h-5" />
              履歴書を作成する
            </button>
          </div>
        )}
        
        {/* Active Resumes */}
        {activeResumes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-base-content mb-4">
              履歴書一覧 ({activeResumes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onDuplicate={handleDuplicate}
                  onSetPrimary={handleSetPrimary}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Archived Resumes */}
        {archivedResumes.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-base-content/70 hover:text-base-content mb-4"
            >
              <ArchiveIcon className="w-5 h-5" />
              <span className="font-semibold">
                アーカイブ ({archivedResumes.length})
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showArchived && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedResumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onDuplicate={handleDuplicate}
                    onSetPrimary={handleSetPrimary}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Create Dialog */}
        {showCreateDialog && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">新しい履歴書を作成</h3>
              <p className="text-sm text-base-content/70 mb-4">
                履歴書の名前を入力してください。後で変更できます。
              </p>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">履歴書名</span>
                </label>
                <input
                  type="text"
                  placeholder="例: スタートアップ用、大企業用"
                  className="input input-bordered w-full"
                  value={newResumeName}
                  onChange={(e) => setNewResumeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div className="modal-action">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewResumeName("");
                  }}
                  className="btn btn-ghost"
                  disabled={isProcessing}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreate}
                  className="btn btn-primary"
                  disabled={isProcessing || !newResumeName.trim()}
                >
                  {isProcessing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "作成"
                  )}
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowCreateDialog(false)}>close</button>
            </form>
          </dialog>
        )}
        
        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">履歴書を削除</h3>
              <p className="text-base-content/70 mb-6">
                「{deleteConfirm.resume_name || "無題の履歴書"}」を削除してもよろしいですか？<br />
                この操作は取り消せません。
              </p>
              
              {deleteConfirm.is_primary && (
                <div className="alert alert-warning mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>主要履歴書は削除できません</span>
                </div>
              )}
              
              <div className="modal-action">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn btn-ghost"
                  disabled={isProcessing}
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-error"
                  disabled={isProcessing || deleteConfirm.is_primary}
                >
                  {isProcessing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "削除"
                  )}
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setDeleteConfirm(null)}>close</button>
            </form>
          </dialog>
        )}
        
        {/* Duplicate Confirmation Dialog */}
        {duplicateConfirm && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">履歴書を複製</h3>
              <p className="text-sm text-base-content/70 mb-4">
                「{duplicateConfirm.resume_name || "無題の履歴書"}」のコピーを作成します。
              </p>
              
              <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-xs">
                  <p>すべての内容がコピーされます</p>
                  <p>公開設定はコピーされません（非公開になります）</p>
                </div>
              </div>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">複製する履歴書名（後で変更できます）</span>
                </label>
                <input
                  type="text"
                  placeholder="履歴書名"
                  className="input input-bordered w-full"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      confirmDuplicate();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div className="modal-action">
                <button
                  onClick={() => {
                    setDuplicateConfirm(null);
                    setDuplicateName("");
                  }}
                  className="btn btn-ghost"
                  disabled={isProcessing}
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDuplicate}
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "複製"
                  )}
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => {
                setDuplicateConfirm(null);
                setDuplicateName("");
              }}>close</button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
}
