import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        <div className={`flex items-center gap-3 border border-gray-300 p-3 rounded-lg input-focus ${error ? 'border-red-300' : ''}`}>
          {icon && (
            <div className="text-blue-600 text-lg flex-shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`flex-1 outline-none bg-transparent text-base ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
