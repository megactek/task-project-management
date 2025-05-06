import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { ArrowLeft, Pencil, Trash } from "lucide-react";
import invariant from "tiny-invariant";

import { deleteNote, getNote } from "~/models/note.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // Use a dummy userId since we're not using auth
  const userId = "dummy-user-id";
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ id: params.noteId, userId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  // Use a dummy userId since we're not using auth
  const userId = "dummy-user-id";
  invariant(params.noteId, "noteId not found");

  await deleteNote({ id: params.noteId, userId });

  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to="/notes" 
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to notes</span>
        </Link>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <span>📝</span> 
            <span>{data.note.title}</span>
          </h3>
          
          <div className="flex gap-2">
            <Link
              to={`/notes/${data.note.id}/edit`}
              className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent/50"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </Link>
            
            <Form method="post">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </Form>
          </div>
        </div>
        
        <div className="prose prose-sm dark:prose-invert">
          {data.note.content ? (
            <p className="text-base text-muted-foreground">{data.note.content}</p>
          ) : (
            <p className="text-base text-muted-foreground italic">No content provided</p>
          )}
        </div>
        
        <div className="pt-4 border-t mt-6">
          <div className="text-sm text-muted-foreground">
            Created: {new Date(data.note.createdAt).toLocaleDateString()}
            {data.note.updatedAt !== data.note.createdAt && (
              <span> · Updated: {new Date(data.note.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div className="text-destructive p-4 border border-destructive/20 rounded-md bg-destructive/5">
      <p className="font-medium">❌ An unexpected error occurred</p>
      <p className="text-sm mt-2">{error.message}</p>
    </div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1 className="text-destructive font-bold text-xl">❓ Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div className="text-muted-foreground p-6 text-center space-y-2">
      <p className="text-4xl">📝</p>
      <h2 className="text-xl font-semibold">Note not found</h2>
      <p>The note you're looking for doesn't exist or was deleted.</p>
      <div className="pt-4">
        <Link to="/notes" className="text-primary hover:underline">
          Return to notes
        </Link>
      </div>
    </div>;
  }

  return <div className="text-destructive p-4">❌ An unexpected error occurred: {error.statusText}</div>;
}
