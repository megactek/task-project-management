import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FolderEdit, Plus, Trash } from "lucide-react";
import { getDb } from "~/models/json-db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const db = await getDb();
  const projects = await db.getProjects();
  
  // Sort projects by most recent first
  const sortedProjects = projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return json({
    projects: sortedProjects,
  });
}

export default function ProjectsIndexPage() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📂</span> Projects
        </h1>
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 py-12 text-center text-muted-foreground border rounded-md bg-card">
            <p className="text-4xl mb-2">📂</p>
            <p className="font-medium">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <>
            {projects.map((project) => (
              <div key={project.id} className="border rounded-md bg-card overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium truncate">{project.title}</h2>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {project.description || "No description provided"}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {project.tasks.length} Tasks
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <FolderEdit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
} 