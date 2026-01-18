
import React, { ButtonHTMLAttributes, InputHTMLAttributes, useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => (
  <div className={`glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 ${hoverEffect ? 'hover:shadow-lg hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const GlassButton: React.FC<GlassButtonProps> = ({ className = '', variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-md hover:shadow-lg',
    secondary: 'bg-white/50 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/15 border border-slate-200/50 dark:border-white/10',
    danger: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30'
  };

  return (
    <button
      className={`px-4 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export const GlassInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 md:py-2.5 text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-indigo-500/20 focus:border-slate-400 dark:focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 ${className}`}
      {...props}
    />
  ));
GlassInput.displayName = 'GlassInput';

interface GlassSelectProps {
  className?: string;
  children: React.ReactNode;
  value?: string | number | undefined;
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  direction?: 'up' | 'down';
  align?: 'left' | 'right'; // Added align prop
}

export const GlassSelect: React.FC<GlassSelectProps> = ({ className = '', children, value, onChange, placeholder = 'Select...', direction = 'down', align = 'left', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract options data from children
  const options = React.Children.toArray(children).map((child: any) => {
    if (child?.props) {
      return {
        value: child.props.value,
        label: child.props.children,
        className: child.props.className
      };
    }
    return null;
  }).filter(Boolean);

  const selectedOption = options.find(opt => String(opt?.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue } });
    }
    setIsOpen(false);
  };

  const positionClasses = direction === 'up'
    ? 'bottom-full mb-2 origin-bottom'
    : 'top-full mt-2 origin-top';

  // Determine horizontal alignment classes
  const alignmentClasses = align === 'right' ? 'right-0' : 'left-0';

  const animationClasses = direction === 'up'
    ? (isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none')
    : (isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none');

  return (
    <div className={`relative ${className}`} ref={containerRef} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 md:py-2.5 text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-indigo-500/20 transition-all text-slate-700 dark:text-slate-200 ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500/50 bg-white dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
      >
        <span className={`truncate mr-2 font-medium ${!selectedOption ? 'text-slate-400 dark:text-slate-500' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Modern Glass Dropdown */}
      <div
        className={`
          absolute z-50 w-full min-w-[120px] ${alignmentClasses}
          bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl 
          border border-slate-200/60 dark:border-white/10 
          rounded-xl shadow-xl dark:shadow-black/50 
          overflow-hidden
          transition-all duration-200 ease-ios-spring
          ${positionClasses}
          ${animationClasses}
        `}
      >
        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
          {options.map((opt: any) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`
                   w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left group
                   ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }
                   ${opt.className || ''}
                 `}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="shrink-0 ml-2 animate-scale-in" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};
