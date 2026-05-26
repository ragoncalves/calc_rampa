import type { ReactNode } from 'react';
import { cn } from './Input';

export function Card({ className, children }: { className?: string, children: ReactNode }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string, children: ReactNode }) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-50 bg-gray-50/50", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string, children: ReactNode }) {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: { className?: string, children: ReactNode }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}
