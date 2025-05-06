import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { FileText, Plus } from "lucide-react";

import { getNoteListItems } from "~/models/note.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Use a dummy userId since we're not using auth
  const userId = "dummy-user-id";
  const noteListItems = await getNoteListItems({ userId });
  return json({ noteListItems });
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📝</span>
          <span>Notes</span>
        </h1>
      </div>

      <main className="flex flex-1 h-full">
        <div className="w-80 border-r h-full overflow-auto">
          <div className="p-4">
            <Link 
              to="new" 
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <span>📝</span>
              <span>New Note</span>
            </Link>
          </div>

          <div className="px-2">
            {data.noteListItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-4xl mb-2">📝</p>
                <p className="font-medium">No notes yet</p>
                <p className="text-sm mt-1">Create your first note to get started</p>
              </div>
            ) : (
              <div className="space-y-1 py-2">
                {data.noteListItems.map((note) => (
                  <NavLink
                    key={note.id}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                        isActive 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-foreground"
                      }`
                    }
                    to={note.id}
                  >
                    <span className="flex-shrink-0">📝</span>
                    <span className="flex-1 truncate">{note.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
