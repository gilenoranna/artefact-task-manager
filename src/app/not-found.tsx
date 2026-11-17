import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

// Rendered for unknown routes and for `notFound()` (e.g. editing a task id
// that does not exist), inside the root layout.
export default function NotFound() {
  return (
    <EmptyState message="Página ou tarefa não encontrada. Ela pode ter sido excluída.">
      <Link href="/" className="btn btn-primary">
        Voltar para a lista
      </Link>
    </EmptyState>
  );
}
