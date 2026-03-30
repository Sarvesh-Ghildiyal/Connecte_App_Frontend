import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      {icon && <div className="text-muted-foreground opacity-40 mb-2">{icon}</div>}
      <p className="text-label-md text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
