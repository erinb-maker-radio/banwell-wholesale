import { cn, getStatusColor } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status';
  status?: string;
}

export default function Badge({ className, variant = 'default', status, children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const colorClass = variant === 'status' && status
    ? getStatusColor(status)
    : 'bg-gray-100 text-gray-800';

  return (
    <span className={cn(baseStyles, colorClass, className)} {...props}>
      {children}
    </span>
  );
}
