type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = "Carregando tarefas…",
}: LoadingStateProps) {
  return (
    <div role="status" className="py-8 text-center text-sm text-gray-600">
      {message}
    </div>
  );
}
