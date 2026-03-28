import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { DatabaseSync } from "node:sqlite";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type TodoFilter = "all" | "active" | "done";

type TodoRow = {
  id: number;
  title: string;
  completed: number;
  created_at: string;
};

const DEFAULT_FILTER: TodoFilter = "all";
const DATABASE_PATH = join(cwd(), "data", "todos.sqlite");

declare global {
  var todoDatabase: DatabaseSync | undefined;
}

function ensureDatabase() {
  mkdirSync(dirname(DATABASE_PATH), { recursive: true });

  const db = new DatabaseSync(DATABASE_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  return db;
}

function getDatabase() {
  if (!globalThis.todoDatabase) {
    globalThis.todoDatabase = ensureDatabase();
  }

  return globalThis.todoDatabase;
}

function mapTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

export function parseTodoFilter(value: string | string[] | undefined): TodoFilter {
  if (value === "active" || value === "done") {
    return value;
  }

  return DEFAULT_FILTER;
}

export function listTodos(filter: TodoFilter = DEFAULT_FILTER) {
  const db = getDatabase();

  const rows = (() => {
    if (filter === "active") {
      return db
        .prepare("SELECT id, title, completed, created_at FROM todos WHERE completed = 0 ORDER BY id DESC")
        .all() as TodoRow[];
    }

    if (filter === "done") {
      return db
        .prepare("SELECT id, title, completed, created_at FROM todos WHERE completed = 1 ORDER BY id DESC")
        .all() as TodoRow[];
    }

    return db
      .prepare("SELECT id, title, completed, created_at FROM todos ORDER BY id DESC")
      .all() as TodoRow[];
  })();

  return rows.map(mapTodo);
}

export function getTodoCounts() {
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS done
      FROM todos`
    )
    .get() as {
    total: number;
    active: number | null;
    done: number | null;
  };

  return {
    total: row.total,
    active: row.active ?? 0,
    done: row.done ?? 0,
  };
}

export function createTodo(title: string) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO todos (title, completed, created_at) VALUES (?, 0, ?)")
    .run(title, now);

  return Number(result.lastInsertRowid);
}

export function toggleTodo(id: number) {
  const db = getDatabase();
  db.prepare(
    `UPDATE todos
      SET completed = CASE completed WHEN 1 THEN 0 ELSE 1 END
      WHERE id = ?`
  ).run(id);
}

export function deleteTodo(id: number) {
  const db = getDatabase();
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
}
