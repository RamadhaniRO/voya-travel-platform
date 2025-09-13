import React from 'react';

const Input = React.forwardRef(({
  type = 'text',
  label,
  placeholder,
  error,
  success,
  warning,
  disabled = false,
  required = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed';

  const stateStyles = {
    default: 'border-gray-300 focus:border-teal-500 focus:ring-teal-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500'
  };

  const iconStyles = 'w-5 h-5 text-gray-400';

  const containerStyles = fullWidth ? 'w-full' : 'w-auto';

  const labelStyles = `block text-sm font-medium text-gray-700 mb-2 ${required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}`;

  const errorStyles = 'mt-1 text-sm text-red-600';
  const successStyles = 'mt-1 text-sm text-green-600';
  const warningStyles = 'mt-1 text-sm text-yellow-600';

  const getCurrentState = () => {
    if (error) return 'error';
    if (success) return 'success';
    if (warning) return 'warning';
    return 'default';
  };

  return (
    <div className={containerStyles}>
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {React.cloneElement(leftIcon, { className: iconStyles })}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`${baseStyles} ${stateStyles[getCurrentState()]} ${leftIcon ? 'pl-12' : ''} ${rightIcon ? 'pr-12' : ''} ${className}`}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {React.cloneElement(rightIcon, { className: iconStyles })}
          </div>
        )}
      </div>
      
      {error && <p className={errorStyles}>{error}</p>}
      {success && <p className={successStyles}>{success}</p>}
      {warning && <p className={warningStyles}>{warning}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
