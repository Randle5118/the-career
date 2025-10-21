"use client";

import type { Application } from "@/types/application";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "@/components/cards/KanbanCard";

interface KanbanColumnProps {
  title: string;
  status: string;
  applications: Application[];
  count: number;
  color?: string;
  onViewDetail?: (application: Application) => void;
  onEdit: (application: Application) => void;
}

export default function KanbanColumn({
  title,
  status,
  applications,
  count,
  color = "bg-base-200",
  onViewDetail,
  onEdit,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-[280px] rounded-lg transition-all self-stretch ${
        isOver ? "bg-primary/5" : ""
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-2 pt-2 shrink-0">
        <h3 className="font-semibold text-sm text-base-content/80">{title}</h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} text-base-content/70`}
        >
          {count}
        </span>
      </div>

      {/* Cards Container */}
      <div
        className={`flex-1 bg-base-200/30 rounded-lg p-3 space-y-2 min-h-0 transition-all ${
          isOver ? "bg-primary/10 ring-2 ring-primary/40 scale-[1.02]" : ""
        }`}
      >
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((application) => (
            <KanbanCard
              key={application.id}
              application={application}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
            />
          ))}
          {applications.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[200px] text-base-content/40 text-sm">
              ドラッグしてカードを追加
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

