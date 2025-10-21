import React from "react";

export interface TabProps {
  id: string;
  label: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
}

export const Tab: React.FC<TabProps> = ({ id, label, description, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${isActive 
          ? "text-primary border-b-2 border-primary bg-primary/5" 
          : "text-base-content/60 hover:text-base-content border-b-2 border-transparent hover:border-base-content/20 hover:bg-base-200/50"
        }
      `}
    >
      {label}
    </button>
  );
};

export interface TabListProps {
  tabs: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = "" 
}) => {
  return (
    <div className={`border-b border-base-300 ${className}`}>
      <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            description={tab.description}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </nav>
    </div>
  );
};
