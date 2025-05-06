import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { getDb } from "~/models/json-db.server";
import { TaskItem } from "~/components/tasks/TaskItem";

export async function loader({ request }: LoaderFunctionArgs) {
  const db = await getDb();
  const tasks = await db.getTasks();
  
  // Sort tasks by most recent first, and filter only archived tasks
  const archivedTasks = tasks
    .filter(task => task.archived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return json({
    tasks: archivedTasks,
  });
}

export default function ArchivedTasksPage() {
  const { tasks } = useLoaderData<typeof loader>();
  
  // Handlers for task actions (will be implemented with form actions)
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    console.log("Toggle complete:", taskId, completed);
  };

  const handleArchiveTask = async (taskId: string) => {
    console.log("Unarchive task:", taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    console.log("Delete task:", taskId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to="/tasks" 
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to active tasks</span>
        </Link>
      </div>
    
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📁</span> Archived Tasks
        </h1>
      </div>
      
      <div className="border rounded-md bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Archived Tasks</h2>
          <p className="text-sm text-muted-foreground">View and manage your archived tasks</p>
        </div>
        
        <div className="p-4">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-4xl mb-2">📁</p>
              <p className="font-medium">No archived tasks</p>
              <p className="text-sm mt-1">Archived tasks will appear here</p>
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