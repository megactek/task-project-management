export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  archived: boolean;
  projectId?: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  mindMap?: MindMapNode[];
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

export type Comment = {
  id: string;
  content: string;
  taskId: string;
  createdAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
};

export type MindMapNode = {
  id: string;
  content: string;
  children?: string[]; // IDs of child nodes
};

export type Analytics = {
  taskCompletionRate: number;
  tasksCompleted: number;
  tasksCreated: number;
  tasksArchived: number;
  projectsCreated: number;
  notesCreated: number;
  lastUpdated: string;
}; 