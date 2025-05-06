import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Calendar, CheckCircle2, FileEdit, FolderOpen, ListChecks, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { getDb } from "~/models/json-db.server";
import { TaskItem } from "~/components/tasks/TaskItem";
import { CreateTaskForm } from "~/components/tasks/CreateTaskForm";

export async function loader({ request }: LoaderFunctionArgs) {
  const db = await getDb();
  const tasks = await db.getTasks();
  const projects = await db.getProjects();
  const notes = await db.getNotes();
  const analytics = await db.getAnalytics();

  // Get recent tasks (not archived)
  const recentTasks = tasks
    .filter(task => !task.archived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get recent projects
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Get recent notes
  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return json({
    recentTasks,
    recentProjects,
    recentNotes,
    projects,
    analytics,
  });
}

export default function Dashboard() {
  const { recentTasks, recentProjects, recentNotes, analytics } = useLoaderData<typeof loader>();

  // Dummy handlers for TaskItem component
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    // This will be implemented with form actions later
    console.log("Toggle complete:", taskId, completed);
  };

  const handleArchiveTask = async (taskId: string) => {
    // This will be implemented with form actions later
    console.log("Archive task:", taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    // This will be implemented with form actions later
    console.log("Delete task:", taskId);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <span>🏠</span>
          <span>Dashboard</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to TaskMaster! Here's an overview of your tasks and projects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Tasks Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tasksCreated}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tasks created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.taskCompletionRate * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Of all tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-500" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.projectsCreated}</div>
            <p className="text-xs text-muted-foreground mt-1">Total projects created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>✅</span> Recent Tasks
            </h2>
            <Link 
              to="/tasks"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <CreateTaskForm />
          <div className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onArchive={handleArchiveTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <div className="border rounded-md p-6 text-center text-muted-foreground">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-medium">No tasks yet</p>
                <p className="text-sm mt-1">Create your first task to get started</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Recent Projects */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>📂</span> Recent Projects
              </h2>
              <Link 
                to="/projects"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map(project => (
                  <Link 
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block border rounded-md p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description || "No description"}
                        </p>
                      </div>
                      <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                        {project.tasks.length} tasks
                      </div>
                    </div>
                  </Link>
                ))}
                
                <Link
                  to="/projects/new"
                  className="flex items-center justify-center gap-1 w-full border rounded-md p-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Project</span>
                </Link>
              </div>
            ) : (
              <div className="border rounded-md p-6 text-center text-muted-foreground">
                <p className="text-4xl mb-2">📂</p>
                <p className="font-medium">No projects yet</p>
                <p className="text-sm mt-1">Create your first project to get started</p>
                <div className="mt-4">
                  <Link
                    to="/projects/new"
                    className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Project</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Notes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>📝</span> Recent Notes
              </h2>
              <Link 
                to="/notes"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            
            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map(note => (
                  <Link 
                    key={note.id}
                    to={`/notes/${note.id}`}
                    className="block border rounded-md p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium flex items-center gap-1">
                        <FileEdit className="h-3 w-3" />
                        {note.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {note.content || "No content"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
                
                <Link
                  to="/notes/new"
                  className="flex items-center justify-center gap-1 w-full border rounded-md p-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Note</span>
                </Link>
              </div>
            ) : (
              <div className="border rounded-md p-6 text-center text-muted-foreground">
                <p className="text-4xl mb-2">📝</p>
                <p className="font-medium">No notes yet</p>
                <p className="text-sm mt-1">Create your first note to get started</p>
                <div className="mt-4">
                  <Link
                    to="/notes/new"
                    className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Note</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 