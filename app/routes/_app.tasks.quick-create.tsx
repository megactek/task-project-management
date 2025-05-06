import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getDb } from "~/models/json-db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return redirect("/");
  }

  const db = await getDb();
  
  // Create a new task with basic information
  await db.createTask({
    title: title.trim(),
    completed: false,
    archived: false,
  });

  return redirect("/tasks");
} 