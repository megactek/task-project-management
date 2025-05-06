import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { ArrowLeft, CheckSquare, Pencil, Square, Trash } from "lucide-react";
import invariant from "tiny-invariant";
import { getDb } from "~/models/json-db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.taskId, "taskId not found");
  
  const db = await getDb();
  const task = await db.getTaskById(params.taskId);
  
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  
  // If this task has a project, get the project details
  let project = null;
  if (task.projectId) {
    project = await db.getProjectById(task.projectId);
  }
  
  return json({
    task,
    project
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  
  invariant(params.taskId, "taskId not found");
  const db = await getDb();
  
  switch (intent) {
    case "toggle-complete": {
      const task = await db.getTaskById(params.taskId);
      if (!task) {
        throw new Response("Not Found", { status: 404 });
      }
      
      await db.updateTask(params.taskId, {
        completed: !task.completed
      });
      return json({ success: true });
    }
    
    case "archive": {
      await db.updateTask(params.taskId, {
        archived: true
      });
      return redirect("/tasks");
    }
    
    case "delete": {
      await db.deleteTask(params.taskId);
      return redirect("/tasks");
    }
    
    default:
      return json({ success: false });
  }
}

export default function TaskDetailPage() {
  const { task, project } = useLoaderData<typeof loader>();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to="/tasks" 
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to tasks</span>
        </Link>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{task.completed ? "✅" : task.archived ? "📁" : "📌"}</span>
            <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
          </h1>
          
          {project && (
            <div className="mt-2">
              <Link 
                to={`/projects/${project.id}`}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                <span>📂</span> {project.title}
              </Link>
            </div>
          )}
          
          {task.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description:</h3>
              <p className={`text-muted-foreground ${task.completed ? "line-through" : ""}`}>
                {task.description}
              </p>
            </div>
          )}
          
          <div className="mt-6 text-sm text-muted-foreground">
            <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
            <div>Updated: {new Date(task.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Form method="post">
            <input type="hidden" name="intent" value="toggle-complete" />
            <button
              type="submit"
              className="inline-flex items-center justify-center w-full gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {task.completed ? (
                <>
                  <Square className="h-4 w-4" />
                  <span>Mark as Incomplete</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </Form>
          
          <Link
            to={`/tasks/${task.id}/edit`}
            className="inline-flex items-center justify-center w-full gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent/50"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Task</span>
          </Link>
          
          <Form method="post" className="mt-2">
            <input type="hidden" name="intent" value="archive" />
            <button
              type="submit"
              className="inline-flex items-center justify-center w-full gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent/50"
            >
              <span>📁</span>
              <span>Archive Task</span>
            </button>
          </Form>
          
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              className="inline-flex items-center justify-center w-full gap-1 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash className="h-4 w-4" />
              <span>Delete Task</span>
            </button>
          </Form>
        </div>
      </div>
      
      {task.comments.length > 0 && (
        <div className="border-t pt-4 mt-6">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <span>💬</span>
            <span>Comments</span>
          </h2>
          
          <div className="space-y-4">
            {task.comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-4 bg-muted/10">
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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
      <p className="text-4xl">✅</p>
      <h2 className="text-xl font-semibold">Task not found</h2>
      <p>The task you're looking for doesn't exist or was deleted.</p>
      <div className="pt-4">
        <Link to="/tasks" className="text-primary hover:underline">
          Return to tasks
        </Link>
      </div>
    </div>;
  }

  return <div className="text-destructive p-4">❌ An unexpected error occurred: {error.statusText}</div>;
} 