"use server";

import { revalidatePath } from "next/cache";

import {
  createTodo,
  deleteTodo,
  toggleTodo,
} from "@/lib/todos";

export type CreateTodoState = {
  error: string | null;
};

export async function createTodoAction(
  _previousState: CreateTodoState,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return {
      error: "Please enter a todo before saving.",
    };
  }

  createTodo(title);
  revalidatePath("/");

  return {
    error: null,
  };
}

export async function toggleTodoAction(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  toggleTodo(id);
  revalidatePath("/");
}

export async function deleteTodoAction(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  deleteTodo(id);
  revalidatePath("/");
}
