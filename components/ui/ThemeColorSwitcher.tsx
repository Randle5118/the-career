"use client";

import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";

const colorThemes = [
  {
    name: "デフォルトブルー",
    primary: "#3B82F6", // Blue
    primaryContent: "#FFFFFF",
  },
  {
    name: "ミントグリーン",
    primary: "#ACE1AF", // Your preferred green
    primaryContent: "#1F2937",
  },
  {
    name: "エメラルド",
    primary: "#10B981", // Emerald
    primaryContent: "#FFFFFF",
  },
  {
    name: "パープル",
    primary: "#8B5CF6", // Purple
    primaryContent: "#FFFFFF",
  },
  {
    name: "ピンク",
    primary: "#EC4899", // Pink
    primaryContent: "#FFFFFF",
  },
  {
    name: "オレンジ",
    primary: "#F59E0B", // Orange
    primaryContent: "#FFFFFF",
  },
  {
    name: "ティール",
    primary: "#14B8A6", // Teal
    primaryContent: "#FFFFFF",
  },
  {
    name: "インディゴ",
    primary: "#6366F1", // Indigo
    primaryContent: "#FFFFFF",
  },
];

export default function ThemeColorSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [customColor, setCustomColor] = useState("#ACE1AF");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    // 從 localStorage 讀取保存的主題
    const savedTheme = localStorage.getItem("theme-color");
    if (savedTheme) {
      const theme = colorThemes.find(t => t.primary === savedTheme);
      if (theme) {
        setSelectedTheme(theme);
        applyTheme(theme);
      }
    }
  }, []);

  const applyTheme = (theme: typeof colorThemes[0]) => {
    // 移除現有的樣式標籤
    const existingStyle = document.getElementById('dynamic-theme-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // 創建新的樣式標籤
    const style = document.createElement('style');
    style.id = 'dynamic-theme-colors';
    style.innerHTML = `
      :root {
        --primary-color: ${theme.primary};
        --primary-content-color: ${theme.primaryContent};
      }
      
      /* 覆蓋所有 primary 相關的類 */
      .btn-primary {
        background-color: ${theme.primary} !important;
        border-color: ${theme.primary} !important;
        color: ${theme.primaryContent} !important;
      }
      .btn-primary:hover {
        background-color: ${theme.primary} !important;
        border-color: ${theme.primary} !important;
        filter: brightness(0.9) !important;
      }
      .text-primary {
        color: ${theme.primary} !important;
      }
      .bg-primary {
        background-color: ${theme.primary} !important;
      }
      .border-primary {
        border-color: ${theme.primary} !important;
      }
      .progress-primary::-webkit-progress-value {
        background-color: ${theme.primary} !important;
      }
      .progress-primary::-moz-progress-bar {
        background-color: ${theme.primary} !important;
      }
      .badge-primary {
        background-color: ${theme.primary} !important;
        color: ${theme.primaryContent} !important;
        border-color: ${theme.primary} !important;
      }
      .hover\\:text-primary:hover {
        color: ${theme.primary} !important;
      }
      .hover\\:border-primary:hover {
        border-color: ${theme.primary} !important;
      }
      .hover\\:bg-primary\\/5:hover {
        background-color: ${theme.primary}0D !important;
      }
      .bg-primary\\/10 {
        background-color: ${theme.primary}1A !important;
      }
      .bg-primary\\/5 {
        background-color: ${theme.primary}0D !important;
      }
    `;
    document.head.appendChild(style);
    
    // 保存到 localStorage
    localStorage.setItem("theme-color", theme.primary);
  };

  const handleThemeChange = (theme: typeof colorThemes[0]) => {
    setSelectedTheme(theme);
    applyTheme(theme);
    setShowCustomInput(false);
  };
  
  const handleCustomColorApply = () => {
    const customTheme = {
      name: "カスタム",
      primary: customColor,
      primaryContent: isColorDark(customColor) ? "#FFFFFF" : "#1F2937",
    };
    setSelectedTheme(customTheme);
    applyTheme(customTheme);
    setShowCustomInput(false);
  };
  
  // 判斷顏色是深色還是淺色
  const isColorDark = (hex: string): boolean => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* 主按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-sm shadow-lg bg-base-100 hover:bg-base-200 border-base-300"
        title="テーマカラー変更"
      >
        <Palette className="w-4 h-4" style={{ color: selectedTheme.primary }} />
      </button>

      {/* 顏色選擇面板 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 面板 */}
          <div className="absolute top-12 left-0 bg-base-100 rounded-lg shadow-xl border border-base-300 p-4 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-base-content">テーマカラー</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-xs btn-ghost btn-circle"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                >
                  {/* 顏色預覽 */}
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-base-300 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {selectedTheme.primary === theme.primary && (
                      <Check className="w-4 h-4" style={{ color: theme.primaryContent }} />
                    )}
                  </div>
                  
                  {/* 顏色名稱 */}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-base-content">{theme.name}</p>
                    <p className="text-xs text-base-content/60">{theme.primary}</p>
                  </div>
                </button>
              ))}
              
              {/* 自定義顏色選項 */}
              <div className="pt-2 border-t border-base-300">
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors border-2 border-dashed border-base-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">+</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-base-content">カスタムカラー</p>
                      <p className="text-xs text-base-content/60">任意の色を設定</p>
                    </div>
                  </button>
                ) : (
                  <div className="p-3 bg-base-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-base-content">カラーコード:</label>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-2 border-base-300"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="input input-sm input-bordered flex-1"
                        placeholder="#ACE1AF"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCustomColorApply}
                        className="btn btn-sm btn-primary flex-1"
                      >
                        適用
                      </button>
                      <button
                        onClick={() => setShowCustomInput(false)}
                        className="btn btn-sm btn-ghost"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-base-300">
              <p className="text-xs text-base-content/60">
                選択したカラーは自動的に保存されます
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

