import React from 'react';
import { cn } from '../../utils';

// ============================================================
// Button
// ============================================================
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#4285F4] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8] shadow-sm',
    secondary: 'bg-[#EBF3FF] text-[#4285F4] hover:bg-[#DBEAFE] active:bg-[#BFDBFE]',
    outline: 'border-2 border-[#4285F4] text-[#4285F4] bg-transparent hover:bg-[#EBF3FF] active:bg-[#DBEAFE]',
    ghost: 'bg-transparent text-[#5F6368] hover:bg-[#F8F9FA] active:bg-[#E8EAED]',
    danger: 'bg-[#EA4335] text-white hover:bg-[#C62828] active:bg-[#B71C1C] shadow-sm',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-sm px-3.5 py-1.5 min-h-[34px]',
    md: 'text-sm px-5 py-2.5 min-h-[42px]',
    lg: 'text-base px-7 py-3 min-h-[50px]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

// ============================================================
// Badge
// ============================================================
interface BadgeProps {
  label: string;
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'blue',
  size = 'sm',
  className,
}) => {
  const variants: Record<string, string> = {
    blue: 'bg-[#EBF3FF] text-[#4285F4]',
    red: 'bg-[#FFEBEE] text-[#EA4335]',
    yellow: 'bg-[#FFF8E1] text-[#F57F17]',
    green: 'bg-[#E8F5E9] text-[#34A853]',
    gray: 'bg-[#F8F9FA] text-[#5F6368]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {label}
    </span>
  );
};

// ============================================================
// StatusBadge
// ============================================================
interface StatusBadgeProps {
  status: 'Open' | 'Closed' | 'Waitlist' | 'Coming Soon';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const map: Record<string, string> = {
    Open: 'badge-open',
    Closed: 'badge-closed',
    Waitlist: 'badge-waitlist',
    'Coming Soon': 'badge-coming',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
        map[status] || 'badge-open'
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

// ============================================================
// Input
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  leftIcon,
  rightIcon,
  label,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#1A1A2E]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#9AA0A6] pointer-events-none">{leftIcon}</span>
        )}
        <input
          id={id}
          className={cn(
            'w-full rounded-xl border border-[#E8EAED] bg-white py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#9AA0A6]',
            'focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            error && 'border-[#EA4335] focus:ring-[#EA4335]',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#9AA0A6]">{rightIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#EA4335]">{error}</p>}
    </div>
  );
};

// ============================================================
// Card
// ============================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-[#E8EAED] rounded-xl',
        hover && 'card-hover cursor-pointer',
        padding && 'p-5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================================
// Skeleton
// ============================================================
interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded }) => {
  return (
    <div
      className={cn(
        'skeleton',
        rounded ? 'rounded-full' : 'rounded-lg',
        className
      )}
    />
  );
};

export const EventCardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#E8EAED] rounded-xl overflow-hidden">
    <Skeleton className="w-full h-48" rounded={false} />
    <div className="p-5 space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-9 w-28 mt-2" />
    </div>
  </div>
);

// ============================================================
// SectionHeader
// ============================================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  centered = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className={cn('space-y-1', centered && 'max-w-2xl')}>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] tracking-tight">{title}</h2>
        {subtitle && <p className="text-[#5F6368] text-base leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="mt-2 sm:mt-0 shrink-0">{action}</div>}
    </div>
  );
};

// ============================================================
// Divider
// ============================================================
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <hr className={cn('border-[#E8EAED]', className)} />
);

// ============================================================
// Avatar
// ============================================================
interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const pixelMap = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <img
      src={src}
      alt={alt}
      width={pixelMap[size]}
      height={pixelMap[size]}
      loading="lazy"
      decoding="async"
      className={cn('rounded-full object-cover shrink-0', sizes[size], className)}
    />
  );
};

// ============================================================
// EmptyState
// ============================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && (
      <div className="mb-4 text-[#9AA0A6] w-12 h-12 flex items-center justify-center">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{title}</h3>
    {description && <p className="text-[#5F6368] text-sm max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
