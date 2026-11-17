type ErrorStateProps = {
  message?: string;
  // The retry button is only rendered when a handler is given. Pass a function
  // only from client components (functions cannot cross the server boundary).
  onRetry?: () => void;
};

export function ErrorState({
  message = "Algo deu errado. Tente novamente em instantes.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center"
    >
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
