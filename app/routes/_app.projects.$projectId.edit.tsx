import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { getDb } from "~/models/json-db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.projectId, "projectId not found");
  
  const db = await getDb();
  const project = await db.getProjectById(params.projectId);
  
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({ project });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.projectId, "projectId not found");
  
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  
  const errors = {
    title: title ? null : "Title is required",
    description: null,
  };
  
  const hasErrors = Object.values(errors).some(Boolean);
  if (hasErrors) {
    return json({ errors }, { status: 400 });
  }
  
  const db = await getDb();
  await db.updateProject(params.projectId, {
    title: title as string,
    description: description as string || undefined,
  });
  
  return redirect(`/projects/${params.projectId}`);
}

export default function EditProjectPage() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to={`/projects/${project.id}`}
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to project</span>
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>📂</span> Edit Project
        </h1>
        
        <Form
          method="post"
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="title">
              Project Title
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              defaultValue={project.title}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
              placeholder="Enter project title..."
            />
            {actionData?.errors?.title ? (
              <div className="pt-1 text-destructive text-sm" id="title-error">
                ❌ {actionData.errors.title}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="description">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={project.description}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter project description..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
} 