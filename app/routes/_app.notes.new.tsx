import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";

import { createNote } from "~/models/note.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Use a dummy userId since we're not using auth
  const userId = "dummy-user-id";

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { body: null, title: "Title is required" } },
      { status: 400 },
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { body: "Content is required", title: null } },
      { status: 400 },
    );
  }

  const note = await createNote({ body, title, userId });

  return redirect(`/notes/${note.id}`);
};

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

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
      
      <div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>📝</span> Create New Note
        </h1>
        
        <Form
          method="post"
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="title">
              Title
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
              placeholder="Enter note title..."
            />
            {actionData?.errors?.title ? (
              <div className="pt-1 text-destructive text-sm" id="title-error">
                ❌ {actionData.errors.title}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="body">
              Content
            </label>
            <textarea
              ref={bodyRef}
              id="body"
              name="body"
              rows={8}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={actionData?.errors?.body ? true : undefined}
              aria-errormessage={
                actionData?.errors?.body ? "body-error" : undefined
              }
              placeholder="Enter note content..."
            />
            {actionData?.errors?.body ? (
              <div className="pt-1 text-destructive text-sm" id="body-error">
                ❌ {actionData.errors.body}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Save Note
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
