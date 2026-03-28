"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  type CreateTodoState,
  createTodoAction,
} from "@/app/actions";

const initialCreateTodoState: CreateTodoState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--color-ink)] px-5 text-sm font-semibold text-white transition hover:bg-[color-mix(in_oklab,var(--color-ink)_88%,white)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Add task"}
    </button>
  );
}

export function AddTodoForm() {
  const [state, formAction] = useActionState(
    createTodoAction,
    initialCreateTodoState
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="title">
          New todo
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Write the next thing that needs doing"
          autoComplete="off"
          className="h-12 flex-1 rounded-2xl border border-[var(--color-line)] bg-white px-4 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--color-accent)_18%,white)]"
        />
        <SubmitButton />
      </div>
      <p aria-live="polite" className="min-h-5 text-sm text-[var(--color-danger)]">
        {state.error}
      </p>
    </form>
  );
}
