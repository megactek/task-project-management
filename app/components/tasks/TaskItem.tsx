import { CheckSquare, Square, MoreVertical, Archive, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Task } from "~/models/types";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onArchive: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({ task, onToggleComplete, onArchive, onDelete }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Get the task emoji based on status and archived
  const getTaskEmoji = () => {
    if (task.completed) return "✅";
    if (task.archived) return "📁";
    return "📌"; // active task
  };

  return (
    <div 
      className={`rounded-md border p-3 ${
        task.completed ? "bg-muted/50" : "bg-card"
      } transition-colors`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id, !task.completed)}
          className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <CheckSquare className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm">{getTaskEmoji()}</span>
            <Link 
              to={`/tasks/${task.id}`}
              className={`font-medium ${
                task.completed ? "text-muted-foreground line-through" : ""
              }`}
            >
              {task.title}
            </Link>
          </div>
          
          {task.description && (
            <p className={`mt-1 text-sm text-muted-foreground line-clamp-2 ${
              task.completed ? "line-through" : ""
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="mt-2 flex items-center text-xs gap-3">
            {task.projectId && (
              <span className="flex items-center gap-1 text-primary">
                <span>📂</span> Project
              </span>
            )}
            
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <span>💬</span> {task.comments.length} {task.comments.length === 1 ? "comment" : "comments"}
              </span>
            )}
            
            <span className="flex items-center gap-1 text-muted-foreground">
              <span>🕒</span> {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${
              isHovered ? "opacity-100" : "opacity-0"
            } hover:opacity-100 transition-opacity`}
            aria-label="Task options"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-52 rounded-md border bg-background shadow-md z-10 py-1">
              <button
                className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => {
                  onToggleComplete(task.id, !task.completed);
                  setShowMenu(false);
                }}
              >
                <span className="mr-2">
                  {task.completed ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                </span>
                {task.completed ? "Mark as incomplete" : "Mark as complete"}
              </button>
              <button
                className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => {
                  onArchive(task.id);
                  setShowMenu(false);
                }}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive task
              </button>
              <button
                className="flex w-full items-center px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                onClick={() => {
                  onDelete(task.id);
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 