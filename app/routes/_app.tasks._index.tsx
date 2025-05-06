import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";
import { getDb } from "~/models/json-db.server";
import { TaskItem } from "~/components/tasks/TaskItem";

export async function loader({ request }: LoaderFunctionArgs) {
  const db = await getDb();
  const tasks = await db.getTasks();
  
  // Sort tasks by most recent first, and filter out archived tasks
  const activeTasks = tasks
    .filter(task => !task.archived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return json({
    tasks: activeTasks,
  });
}

export default function TasksIndexPage() {
  const { tasks } = useLoaderData<typeof loader>();
  
  // Handlers for task actions (will be implemented with form actions)
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>✅</span> Tasks
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/tasks/archived"
            className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent/50"
          >
            <span>📁</span>
            <span>Archived Tasks</span>
          </Link>
          <Link
            to="/tasks/new"
            className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Link>
        </div>
      </div>
      
      <div className="border rounded-md bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Active Tasks</h2>
          <p className="text-sm text-muted-foreground">Manage your active tasks</p>
        </div>
        
        <div className="p-4">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-medium">No active tasks</p>
              <p className="text-sm mt-1">Create your first task to get started</p>
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
    </div>
  );
} 