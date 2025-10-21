"use client";

import type { Application, ApplicationStatus } from "@/types/application";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { useState, useEffect } from "react";
import KanbanColumn from "@/components/ui/KanbanColumn";
import KanbanCard from "@/components/cards/KanbanCard";

interface KanbanViewProps {
  applications: Application[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onViewDetail?: (application: Application) => void;
  onEdit: (application: Application) => void;
}

const columns = [
  {
    id: "bookmarked",
    title: "ブックマーク",
    color: "bg-base-300",
  },
  {
    id: "applied",
    title: "応募済み",
    color: "bg-info/20",
  },
  {
    id: "interview",
    title: "面談・面接",
    color: "bg-primary/20",
  },
  {
    id: "offer",
    title: "内定",
    color: "bg-success/20",
  },
  {
    id: "rejected",
    title: "辞退・不採用",
    color: "bg-error/20",
  },
];

export default function KanbanView({
  applications,
  onUpdateStatus,
  onViewDetail,
  onEdit,
}: KanbanViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the target column
    let targetStatus: string | null = null;

    // Check if dropped directly on a column
    const isOverColumn = columns.some((col) => col.id === overId);
    if (isOverColumn) {
      targetStatus = overId;
    } else {
      // Check if dropped on a card, find the card's column
      const targetCard = applications.find((app) => app.id === overId);
      if (targetCard) {
        targetStatus = targetCard.status;
      }
    }

    // Update status if we found a target column
    if (targetStatus) {
      const activeApplication = applications.find((app) => app.id === activeId);
      if (activeApplication && activeApplication.status !== targetStatus) {
        onUpdateStatus(activeId, targetStatus as ApplicationStatus);
      }
    }

    setActiveId(null);
    setOverId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Get stats for each column
  const getColumnApplications = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  const activeApplication = activeId
    ? applications.find((app) => app.id === activeId)
    : null;

  // Show static version during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map((column) => {
          const columnApplications = getColumnApplications(column.id);
          return (
            <div key={column.id} className="flex flex-col min-w-[280px] w-[280px] rounded-lg self-stretch">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-2 pt-2 shrink-0">
                <h3 className="font-semibold text-sm text-base-content/80">{column.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${column.color} text-base-content/70`}>
                  {columnApplications.length}
                </span>
              </div>
              {/* Cards Container */}
              <div className="flex-1 bg-base-200/30 rounded-lg p-3 space-y-2 min-h-0">
                {columnApplications.map((app) => (
                  <KanbanCard 
                    key={app.id}
                    application={app} 
                    onViewDetail={onViewDetail}
                    onEdit={onEdit} 
                  />
                ))}
                {columnApplications.length === 0 && (
                  <div className="flex items-center justify-center h-full min-h-[200px] text-base-content/40 text-sm">
                    カードを追加
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map((column) => {
          const columnApplications = getColumnApplications(column.id);
          return (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.id}
              applications={columnApplications}
              count={columnApplications.length}
              color={column.color}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard application={activeApplication} onEdit={onEdit} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

