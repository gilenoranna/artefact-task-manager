type EmptyStateProps = {
  message?: string;
  // Optional slot for an action, e.g. a "Nova tarefa" link.
  children?: React.ReactNode;
};

export function EmptyState({
  message = "Nenhuma tarefa ainda. Crie a primeira!",
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-gray-600">{message}</p>
      {children}
    </div>
  );
}
