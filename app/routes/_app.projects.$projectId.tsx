import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { ArrowLeft, Pencil, Plus, Trash } from "lucide-react";
import invariant from "tiny-invariant";
import { getDb } from "~/models/json-db.server";
import { TaskItem } from "~/components/tasks/TaskItem";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.projectId, "projectId not found");
  
  const db = await getDb();
  const project = await db.getProjectById(params.projectId);
  
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  
  // Get all tasks for this project with full details
  const allTasks = await db.getTasks();
  const projectTasks = allTasks.filter(task => task.projectId === project.id);
  
  return json({
    project,
    tasks: projectTasks
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  invariant(params.projectId, "projectId not found");
  const db = await getDb();
  
  if (intent === "delete") {
    await db.deleteProject(params.projectId);
    return json({ success: true });
  }
  
  return json({ success: false });
}

export default function ProjectDetailPage() {
  const { project, tasks } = useLoaderData<typeof loader>();
  
  // Dummy handlers for task actions
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    console.log("Toggle complete:", taskId, completed);
  };

  const handleArchiveTask = async (taskId: string) => {
    console.log("Archive task:", taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log("Delete task:", taskId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to="/projects" 
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to projects</span>
        </Link>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>📂</span>
            <span>{project.title}</span>
          </h1>
          {project.description && (
            <p className="mt-2 text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/projects/${project.id}/edit`}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Project</span>
          </Link>
          
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </Form>
        </div>
      </div>
      
      <div className="border-t pt-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium flex items-center gap-2">
            <span>✅</span>
            <span>Project Tasks</span>
          </h2>
          
          <Link
            to={`/tasks/new?projectId=${project.id}`}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Link>
        </div>
        
        {tasks.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-md">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-medium">No tasks in this project yet</p>
            <p className="text-sm mt-1">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onArchive={handleArchiveTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
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
      <p className="text-4xl">📂</p>
      <h2 className="text-xl font-semibold">Project not found</h2>
      <p>The project you're looking for doesn't exist or was deleted.</p>
      <div className="pt-4">
        <Link to="/projects" className="text-primary hover:underline">
          Return to projects
        </Link>
      </div>
    </div>;
  }

  return <div className="text-destructive p-4">❌ An unexpected error occurred: {error.statusText}</div>;
} 