import { getDb } from "~/models/json-db.server";
import type { Note } from "~/models/types";

export async function getNote({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const db = await getDb();
  const note = await db.getNoteById(id);
  return note;
}

export async function getNoteListItems({ userId }: { userId: string }) {
  const db = await getDb();
  const notes = await db.getNotes();
  
  // Sort notes by updatedAt in descending order
  return notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(note => ({
      id: note.id,
      title: note.title
    }));
}

export async function createNote({
  body,
  title,
  userId,
}: {
  body: string;
  title: string;
  userId: string;
}) {
  const db = await getDb();
  return db.createNote({
    title,
    content: body,
    tags: [],
  });
}

export async function updateNote({
  id,
  userId,
  title,
  body,
}: {
  id: string;
  userId: string;
  title: string;
  body: string;
}) {
  const db = await getDb();
  return db.updateNote(id, {
    title,
    content: body,
  });
}

export async function deleteNote({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const db = await getDb();
  return db.deleteNote(id);
}
