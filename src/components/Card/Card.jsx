import React from 'react';

const Card = React.forwardRef(({
  children,
  variant = 'basic',
  image,
  imageAlt,
  title,
  subtitle,
  description,
  price,
  rating,
  actions,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300';

  const variantStyles = {
    basic: 'p-6',
    image: 'p-0',
    product: 'p-0'
  };

  const imageStyles = 'w-full h-48 object-cover';
  const contentStyles = variant === 'image' || variant === 'product' ? 'p-6' : '';
  
  const titleStyles = 'text-xl font-bold text-gray-900 mb-2';
  const subtitleStyles = 'text-sm text-gray-500 mb-1';
  const descriptionStyles = 'text-gray-600 mb-4';
  const priceStyles = 'text-2xl font-bold text-teal-600 mb-2';
  const ratingStyles = 'flex items-center space-x-2 mb-4';

  const StarIcon = ({ filled, className }) => (
    <svg
      className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  const renderRating = (ratingValue) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          filled={i <= ratingValue}
        />
      );
    }
    return stars;
  };

  const renderImage = () => {
    if (!image) return null;
    return (
      <img
        src={image}
        alt={imageAlt || title || 'Card image'}
        className={imageStyles}
      />
    );
  };

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {(variant === 'image' || variant === 'product') && renderImage()}
      
      <div className={contentStyles}>
        {subtitle && <p className={subtitleStyles}>{subtitle}</p>}
        {title && <h3 className={titleStyles}>{title}</h3>}
        {description && <p className={descriptionStyles}>{description}</p>}
        {price && <p className={priceStyles}>{price}</p>}
        
        {rating && (
          <div className={ratingStyles}>
            {renderRating(rating)}
            <span className="text-sm text-gray-600">({rating})</span>
          </div>
        )}
        
        {actions && (
          <div className="flex gap-2 mt-4">
            {actions}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
