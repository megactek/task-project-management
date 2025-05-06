import { Link } from "@remix-run/react";
import { Plus } from "lucide-react";

export default function NotesIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
      <div className="text-6xl">📝</div>
      <h2 className="text-2xl font-semibold">Note Details</h2>
      <p className="text-muted-foreground">
        Select a note from the sidebar to view it, or create a new note to get started.
      </p>
      <div>
        <Link
          to="/notes/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <span>📝</span>
          <span>Create a new note</span>
        </Link>
      </div>
    </div>
  );
}
