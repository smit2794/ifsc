// src/components/ui/Forms.tsx
import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

// Input component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-textPrimary">
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full py-1.5 px-3 text-xs bg-white border rounded-md transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brandNavy ${
              leftIcon ? 'pl-8' : ''
            } ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
                : 'border-borderColor text-textPrimary hover:border-gray-400'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Select component
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-textPrimary">
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full py-1.5 px-3 text-xs bg-white border rounded-md transition-colors text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy ${
            error
              ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-borderColor hover:border-gray-400'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const areaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={areaId} className="block text-xs font-semibold text-textPrimary">
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={`w-full p-2 text-xs bg-white border rounded-md transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brandNavy ${
            error
              ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-borderColor text-textPrimary hover:border-gray-400'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Toggle component
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative inline-flex items-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brandNavy rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-brandNavy"></div>
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-xs font-semibold text-textPrimary block">{label}</span>}
          {description && <span className="text-[11px] text-textSecondary block mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
};

// Checkbox component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const checkId = id || (label ? `check-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label htmlFor={checkId} className={`flex items-start gap-2.5 cursor-pointer select-none ${className}`}>
        <input
          id={checkId}
          type="checkbox"
          ref={ref}
          className="rounded border-borderColor text-brandNavy focus:ring-brandNavy h-4 w-4 mt-0.5"
          {...props}
        />
        {(label || description) && (
          <div>
            {label && <span className="text-xs font-medium text-textPrimary block">{label}</span>}
            {description && <span className="text-[11px] text-textSecondary block mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// DatePicker component
export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `date-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-textPrimary">
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <input
            id={inputId}
            ref={ref}
            type="date"
            className={`w-full py-1.5 pl-8 pr-3 text-xs bg-white border rounded-md transition-colors text-textPrimary focus:outline-none focus:ring-2 focus:ring-brandNavy ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
                : 'border-borderColor hover:border-gray-400'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-textSecondary">{helperText}</p>}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

// Radio & RadioGroup component
export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  error?: string;
  helperText?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  direction = 'vertical',
  error,
  helperText,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && <span className="block text-xs font-semibold text-textPrimary">{label}</span>}
      <div className={`gap-3 ${direction === 'horizontal' ? 'flex flex-wrap items-center' : 'space-y-2'}`}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-2.5 cursor-pointer select-none ${
                opt.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="mt-0.5 h-3.5 w-3.5 border-borderColor text-brandNavy focus:ring-brandNavy cursor-pointer"
              />
              <div>
                <span className="text-xs font-medium text-textPrimary block">{opt.label}</span>
                {opt.description && (
                  <span className="text-[11px] text-textSecondary block mt-0.5">{opt.description}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-textSecondary">{helperText}</p>}
    </div>
  );
};
