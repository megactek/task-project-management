import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useSearchParams } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { getDb } from "~/models/json-db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  
  const db = await getDb();
  const projects = await db.getProjects();
  
  return json({
    projects,
    selectedProjectId: projectId
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const projectId = formData.get("projectId");
  
  const errors = {
    title: title ? null : "Title is required",
    description: null,
    projectId: null,
  };
  
  const hasErrors = Object.values(errors).some(Boolean);
  if (hasErrors) {
    return json({ errors }, { status: 400 });
  }
  
  const db = await getDb();
  const task = await db.createTask({
    title: title as string,
    description: description as string || undefined,
    projectId: projectId as string || undefined,
    completed: false,
    archived: false,
  });
  
  // If task was created for a specific project, redirect back to that project
  if (projectId) {
    return redirect(`/projects/${projectId}`);
  }
  
  return redirect("/tasks");
}

export default function NewTaskPage() {
  const { projects, selectedProjectId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to={projectId ? `/projects/${projectId}` : "/tasks"} 
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {projectId ? "project" : "tasks"}</span>
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>✅</span> Create New Task
        </h1>
        
        <Form
          method="post"
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="title">
              Title
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
              placeholder="Enter task title..."
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
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter task details..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="projectId">
              Project (optional)
            </label>
            <select
              id="projectId"
              name="projectId"
              defaultValue={selectedProjectId || ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Create Task
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
} 