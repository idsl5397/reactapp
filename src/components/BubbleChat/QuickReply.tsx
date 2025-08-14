import React from "react";
import {ChevronDown, ChevronUp} from "lucide-react";



interface QuickReplyProps {
  options: string[];
  onSelect: (option: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}


const QuickReply: React.FC<QuickReplyProps> = ({ options, onSelect, isVisible, onToggle }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="px-2 sm:px-4 py-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs sm:text-sm text-gray-500 font-medium">快速回覆：</div>
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-xs"
        >
    {isVisible ?(<ChevronDown />):(<ChevronUp />)}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isVisible 
            ? 'max-h-32 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-wrap gap-1 sm:gap-2 pb-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelect(option)}
              className="btn btn-outline btn-xs sm:btn-sm hover:btn-primary transition-all duration-200
                hover:scale-105 active:scale-95 text-xs sm:text-sm whitespace-nowrap"
              style={{
                animation: isVisible ? `slideInRight 0.3s ease-out ${index * 0.1}s forwards` : 'none',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(20px)'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


export default QuickReply;
