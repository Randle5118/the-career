/**
 * useArrayField - 陣列表單欄位管理 Hook
 * 
 * 用途：統一管理陣列型表單的 CRUD 操作
 * 影響範圍：所有列表型表單（Education, Skills, WorkExperience 等）
 */

import { useState, useCallback } from "react";

/**
 * 陣列欄位管理 Hook
 * 
 * @template T - 陣列項目的型別
 * @param initialItems - 初始陣列
 * @param createEmptyItem - 創建空項目的函式
 * @returns 陣列操作方法和當前陣列
 * 
 * @example
 * ```tsx
 * const { items, add, remove, update, replace } = useArrayField(
 *   education,
 *   () => ({ date: "", school_name: "", major: "", degree: "" })
 * );
 * 
 * // 新增項目
 * <button onClick={add}>追加</button>
 * 
 * // 刪除項目
 * <button onClick={() => remove(index)}>削除</button>
 * 
 * // 更新項目
 * <input onChange={(e) => update(index, "date", e.target.value)} />
 * ```
 */
/**
 * 陣列項目移動輔助函式
 */
function moveArrayItem<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [item] = newArray.splice(from, 1);
  newArray.splice(to, 0, item);
  return newArray;
}

export function useArrayField<T>(
  initialItems: T[],
  createEmptyItem: () => T
) {
  const [items, setItems] = useState<T[]>(initialItems);

  /**
   * 新增一個空項目到陣列末尾
   */
  const add = useCallback(() => {
    setItems((prev) => [...prev, createEmptyItem()]);
  }, [createEmptyItem]);

  /**
   * 刪除指定索引的項目
   */
  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 移動項目位置
   */
  const move = useCallback((from: number, to: number) => {
    setItems((prev) => moveArrayItem(prev, from, to));
  }, []);

  /**
   * 更新指定索引項目的單一欄位
   */
  const update = useCallback(
    <K extends keyof T>(index: number, field: K, value: T[K]) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  /**
   * 更新指定索引項目的多個欄位
   */
  const updateMultiple = useCallback(
    (index: number, updates: Partial<T>) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  /**
   * 替換整個陣列
   */
  const replace = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  /**
   * 重置為初始陣列
   */
  const reset = useCallback(() => {
    setItems(initialItems);
  }, [initialItems]);

  return {
    items,
    add,
    remove,
    move,
    update,
    updateMultiple,
    replace,
    reset,
  };
}

/**
 * 使用外部受控陣列的版本
 * 
 * 適用於父組件已經管理陣列狀態的場景（如 Resume 表單）
 * 
 * @example
 * ```tsx
 * const arrayHelpers = useControlledArrayField(
 *   education,
 *   setEducation,
 *   () => ({ date: "", school_name: "", major: "", degree: "" })
 * );
 * ```
 */
export function useControlledArrayField<T>(
  items: T[],
  setItems: (items: T[]) => void,
  createEmptyItem: () => T
) {
  const add = useCallback(() => {
    setItems([...items, createEmptyItem()]);
  }, [items, setItems, createEmptyItem]);

  const remove = useCallback(
    (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    },
    [items, setItems]
  );

  const move = useCallback(
    (from: number, to: number) => {
      setItems(moveArrayItem(items, from, to));
    },
    [items, setItems]
  );

  const update = useCallback(
    <K extends keyof T>(index: number, field: K, value: T[K]) => {
      setItems(
        items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      );
    },
    [items, setItems]
  );

  const updateMultiple = useCallback(
    (index: number, updates: Partial<T>) => {
      setItems(
        items.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        )
      );
    },
    [items, setItems]
  );

  const replace = useCallback(
    (newItems: T[]) => {
      setItems(newItems);
    },
    [setItems]
  );

  return {
    items, // 返回 items 以便在組件中使用
    add,
    remove,
    move,
    update,
    updateMultiple,
    replace,
  };
}

