import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { getDb } from "~/models/json-db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.taskId, "taskId not found");
  
  const db = await getDb();
  const task = await db.getTaskById(params.taskId);
  
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json({ task });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.taskId, "taskId not found");
  
  const formData = await request.formData();
  const content = formData.get("content");
  
  if (!content || typeof content !== "string" || content.trim() === "") {
    return json(
      { errors: { content: "Comment cannot be empty" } },
      { status: 400 }
    );
  }
  
  const db = await getDb();
  await db.addCommentToTask(params.taskId, content);
  
  return redirect(`/tasks/${params.taskId}/comments`);
}

export default function TaskCommentsPage() {
  const { task } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (actionData?.errors?.content) {
      contentRef.current?.focus();
    }
  }, [actionData]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link 
          to={`/tasks/${task.id}`}
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to task</span>
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span>💬</span> Comments
        </h1>
        <h2 className="text-lg text-muted-foreground flex items-center gap-2 mb-6">
          <span>{task.completed ? "✅" : task.archived ? "📁" : "📌"}</span>
          <span>{task.title}</span>
        </h2>
        
        <div className="space-y-6">
          <Form
            method="post"
            className="border rounded-md p-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="content">
                Add a comment
              </label>
              <textarea
                ref={contentRef}
                id="content"
                name="content"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Type your comment here..."
                aria-invalid={actionData?.errors?.content ? true : undefined}
              />
              {actionData?.errors?.content ? (
                <div className="pt-1 text-destructive text-sm">
                  ❌ {actionData.errors.content}
                </div>
              ) : null}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Add Comment
              </button>
            </div>
          </Form>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-medium">Comments ({task.comments.length})</h3>
            
            {task.comments.length === 0 ? (
              <div className="text-center text-muted-foreground p-6 border rounded-md">
                <p>No comments yet. Be the first to add a comment!</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 