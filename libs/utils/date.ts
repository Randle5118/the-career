/**
 * Date Utility Functions
 * 
 * 日付関連のユーティリティ関数
 */

/**
 * 日付を "YYYY/MM/DD" 形式にフォーマット
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  } catch (error) {
    return '-';
  }
}

/**
 * 日付を "YYYY年MM月DD日" 形式にフォーマット
 */
export function formatDateJapanese(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}年${month}月${day}日`;
  } catch (error) {
    return '-';
  }
}

/**
 * 相対時間を取得 (例: "2日前", "3ヶ月前")
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffYear > 0) return `${diffYear}年前`;
    if (diffMonth > 0) return `${diffMonth}ヶ月前`;
    if (diffDay > 0) return `${diffDay}日前`;
    if (diffHour > 0) return `${diffHour}時間前`;
    if (diffMin > 0) return `${diffMin}分前`;
    return 'たった今';
  } catch (error) {
    return '-';
  }
}

