import Link from "next/link";

import {
  deleteTodoAction,
  toggleTodoAction,
} from "@/app/actions";
import { AddTodoForm } from "@/components/add-todo-form";
import {
  getTodoCounts,
  listTodos,
  parseTodoFilter,
  type TodoFilter,
} from "@/lib/todos";

export const runtime = "nodejs";

type HomeProps = {
  searchParams: Promise<{ filter?: string | string[] }>;
};

const FILTERS: { label: string; value: TodoFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Done", value: "done" },
];

function EmptyState({ filter }: { filter: TodoFilter }) {
  const copy = {
    all: "No tasks yet. Add your first item to get moving.",
    active: "Nothing active right now. Clear target, clean slate.",
    done: "No completed tasks yet. Finish one to see it here.",
  } satisfies Record<TodoFilter, string>;

  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--color-line)] bg-[var(--color-panel-soft)] px-6 py-12 text-center">
      <p className="text-base font-medium text-[var(--color-ink)]">
        {copy[filter]}
      </p>
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const filter = parseTodoFilter(resolvedSearchParams.filter);
  const todos = listTodos(filter);
  const counts = getTodoCounts();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(249,244,237,0.92))] p-6 shadow-[0_24px_80px_rgba(102,74,37,0.10)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.14),transparent_70%)] blur-3xl" />
        <div className="relative space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Single list. Clear head.
            </p>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
                A focused TODO app built for quick capture and steady progress.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-muted-strong)] sm:text-lg">
                Add tasks, keep active work visible, and review what is already
                finished without leaving the page.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-sm">
              <p className="text-sm text-[var(--color-muted)]">Total tasks</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
                {counts.total}
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-sm">
              <p className="text-sm text-[var(--color-muted)]">In progress</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
                {counts.active}
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/75 p-4 backdrop-blur-sm">
              <p className="text-sm text-[var(--color-muted)]">Completed</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
                {counts.done}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-5 shadow-[0_18px_50px_rgba(63,41,14,0.08)] sm:p-6">
            <AddTodoForm />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => {
              const isCurrent = filter === item.value;

              return (
                <Link
                  key={item.value}
                  href={item.value === "all" ? "/" : `/?filter=${item.value}`}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                    isCurrent
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-white/75 text-[var(--color-muted-strong)] hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-3">
            {todos.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              todos.map((todo) => (
                <article
                  key={todo.id}
                  className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--color-line)] bg-white/88 p-5 shadow-[0_12px_35px_rgba(91,64,30,0.08)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-lg font-medium break-words ${
                        todo.completed
                          ? "text-[var(--color-muted)] line-through"
                          : "text-[var(--color-ink)]"
                      }`}
                    >
                      {todo.title}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Created {new Date(todo.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <form action={toggleTodoAction}>
                      <input type="hidden" name="id" value={todo.id} />
                      <button
                        type="submit"
                        className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold transition ${
                          todo.completed
                            ? "bg-[var(--color-panel-soft)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-panel-soft)_70%,white)]"
                            : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] hover:bg-[color-mix(in_oklab,var(--color-accent-soft)_82%,white)]"
                        }`}
                      >
                        {todo.completed ? "Mark active" : "Mark done"}
                      </button>
                    </form>

                    <form action={deleteTodoAction}>
                      <input type="hidden" name="id" value={todo.id} />
                      <button
                        type="submit"
                        className="inline-flex h-11 items-center rounded-full border border-[var(--color-line)] px-4 text-sm font-semibold text-[var(--color-muted-strong)] transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
