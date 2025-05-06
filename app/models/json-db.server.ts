import fs from "node:fs/promises";
import path from "node:path";
import { Task, Project, Note, Analytics, Comment, MindMapNode } from "./types";

/**
 * A simple JSON-based persistence layer for the Todo app
 */
class JsonDb {
  private dbPath: string;
  private tasksPath: string;
  private projectsPath: string;
  private notesPath: string;
  private analyticsPath: string;

  constructor(dbPath: string = path.join(process.cwd(), "data")) {
    this.dbPath = dbPath;
    this.tasksPath = path.join(this.dbPath, "tasks.json");
    this.projectsPath = path.join(this.dbPath, "projects.json");
    this.notesPath = path.join(this.dbPath, "notes.json");
    this.analyticsPath = path.join(this.dbPath, "analytics.json");
  }

  /**
   * Initialize the database with empty collections if they don't exist
   */
  async init() {
    try {
      await fs.mkdir(this.dbPath, { recursive: true });
      
      // Initialize tasks file if it doesn't exist
      try {
        await fs.access(this.tasksPath);
      } catch {
        await fs.writeFile(this.tasksPath, JSON.stringify([]));
      }
      
      // Initialize projects file if it doesn't exist
      try {
        await fs.access(this.projectsPath);
      } catch {
        await fs.writeFile(this.projectsPath, JSON.stringify([]));
      }
      
      // Initialize notes file if it doesn't exist
      try {
        await fs.access(this.notesPath);
      } catch {
        await fs.writeFile(this.notesPath, JSON.stringify([]));
      }
      
      // Initialize analytics file if it doesn't exist
      try {
        await fs.access(this.analyticsPath);
      } catch {
        const defaultAnalytics: Analytics = {
          taskCompletionRate: 0,
          tasksCompleted: 0,
          tasksCreated: 0,
          tasksArchived: 0,
          projectsCreated: 0,
          notesCreated: 0,
          lastUpdated: new Date().toISOString(),
        };
        await fs.writeFile(
          this.analyticsPath, 
          JSON.stringify(defaultAnalytics)
        );
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  // Tasks CRUD operations
  async getTasks(): Promise<Task[]> {
    const data = await fs.readFile(this.tasksPath, "utf-8");
    return JSON.parse(data);
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find((task) => task.id === id) || null;
  }

  async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };
    tasks.push(newTask);
    await fs.writeFile(this.tasksPath, JSON.stringify(tasks));
    
    // Update analytics
    await this.updateAnalytics({
      tasksCreated: 1
    });
    
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);
    
    if (taskIndex === -1) return null;
    
    // If marking as completed and it wasn't before, update analytics
    if (updates.completed && !tasks[taskIndex].completed) {
      await this.updateAnalytics({
        tasksCompleted: 1
      });
    }
    
    // If marking as archived and it wasn't before, update analytics
    if (updates.archived && !tasks[taskIndex].archived) {
      await this.updateAnalytics({
        tasksArchived: 1
      });
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    await fs.writeFile(this.tasksPath, JSON.stringify(tasks));
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter((task) => task.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    await fs.writeFile(this.tasksPath, JSON.stringify(filteredTasks));
    return true;
  }

  // Task Comments
  async addCommentToTask(taskId: string, content: string): Promise<Comment | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    
    if (taskIndex === -1) return null;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      content,
      taskId,
      createdAt: new Date().toISOString(),
    };
    
    tasks[taskIndex].comments.push(newComment);
    await fs.writeFile(this.tasksPath, JSON.stringify(tasks));
    
    return newComment;
  }

  // Projects CRUD operations
  async getProjects(): Promise<Project[]> {
    const data = await fs.readFile(this.projectsPath, "utf-8");
    return JSON.parse(data);
  }

  async getProjectById(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find((project) => project.id === id) || null;
  }

  async createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">): Promise<Project> {
    const projects = await this.getProjects();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
    };
    projects.push(newProject);
    await fs.writeFile(this.projectsPath, JSON.stringify(projects));
    
    // Update analytics
    await this.updateAnalytics({
      projectsCreated: 1
    });
    
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>): Promise<Project | null> {
    const projects = await this.getProjects();
    const projectIndex = projects.findIndex((project) => project.id === id);
    
    if (projectIndex === -1) return null;
    
    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    projects[projectIndex] = updatedProject;
    await fs.writeFile(this.projectsPath, JSON.stringify(projects));
    
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const projects = await this.getProjects();
    const filteredProjects = projects.filter((project) => project.id !== id);
    
    if (filteredProjects.length === projects.length) return false;
    
    await fs.writeFile(this.projectsPath, JSON.stringify(filteredProjects));
    return true;
  }

  // Notes CRUD operations
  async getNotes(): Promise<Note[]> {
    const data = await fs.readFile(this.notesPath, "utf-8");
    return JSON.parse(data);
  }

  async getNoteById(id: string): Promise<Note | null> {
    const notes = await this.getNotes();
    return notes.find((note) => note.id === id) || null;
  }

  async createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
    const notes = await this.getNotes();
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.push(newNote);
    await fs.writeFile(this.notesPath, JSON.stringify(notes));
    
    // Update analytics
    await this.updateAnalytics({
      notesCreated: 1
    });
    
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>): Promise<Note | null> {
    const notes = await this.getNotes();
    const noteIndex = notes.findIndex((note) => note.id === id);
    
    if (noteIndex === -1) return null;
    
    const updatedNote = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    notes[noteIndex] = updatedNote;
    await fs.writeFile(this.notesPath, JSON.stringify(notes));
    
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    const notes = await this.getNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);
    
    if (filteredNotes.length === notes.length) return false;
    
    await fs.writeFile(this.notesPath, JSON.stringify(filteredNotes));
    return true;
  }

  // Analytics operations
  async getAnalytics(): Promise<Analytics> {
    const data = await fs.readFile(this.analyticsPath, "utf-8");
    return JSON.parse(data);
  }

  private async updateAnalytics(updates: Partial<Omit<Analytics, "lastUpdated" | "taskCompletionRate">>) {
    const analytics = await this.getAnalytics();
    
    const updatedAnalytics: Analytics = {
      ...analytics,
      ...updates,
      tasksCreated: (analytics.tasksCreated || 0) + (updates.tasksCreated || 0),
      tasksCompleted: (analytics.tasksCompleted || 0) + (updates.tasksCompleted || 0),
      tasksArchived: (analytics.tasksArchived || 0) + (updates.tasksArchived || 0),
      projectsCreated: (analytics.projectsCreated || 0) + (updates.projectsCreated || 0),
      notesCreated: (analytics.notesCreated || 0) + (updates.notesCreated || 0),
      lastUpdated: new Date().toISOString(),
    };
    
    // Calculate task completion rate
    if (updatedAnalytics.tasksCreated > 0) {
      updatedAnalytics.taskCompletionRate = 
        updatedAnalytics.tasksCompleted / updatedAnalytics.tasksCreated;
    }
    
    await fs.writeFile(
      this.analyticsPath, 
      JSON.stringify(updatedAnalytics)
    );
    
    return updatedAnalytics;
  }
}

// Create and initialize a singleton instance
let db: JsonDb | null = null;

export const getDb = async () => {
  if (!db) {
    db = new JsonDb();
    await db.init();
  }
  return db;
}; 