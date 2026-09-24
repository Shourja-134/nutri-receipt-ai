import fs from "fs/promises";
import path from "path";

export type SessionRecord = {
  id: string;
  createdAt: string;
};

export type FeedbackRecord = {
  id: string;
  sessionId?: string;
  originalProductId: string;
  replacementProductId: string;
  event: "accepted" | "dismissed";
  catalogVersion: string;
  createdAt: string;
};

export type DataStore = {
  sessions: SessionRecord[];
  feedback: FeedbackRecord[];
};

const DATA_PATH = path.join(process.cwd(), "data", "store.json");

async function ensureStore(): Promise<DataStore> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as DataStore;
    return {
      sessions: parsed.sessions ?? [],
      feedback: parsed.feedback ?? []
    };
  } catch {
    const initial: DataStore = { sessions: [], feedback: [] };
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function writeStore(store: DataStore) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2));
}

export async function createSession() {
  const store = await ensureStore();
  const session: SessionRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  store.sessions.push(session);
  await writeStore(store);
  return session;
}

export async function getSession(sessionId?: string) {
  const store = await ensureStore();
  return store.sessions.find((session) => session.id === sessionId) ?? null;
}

export async function logFeedback(input: Omit<FeedbackRecord, "id" | "createdAt">) {
  const store = await ensureStore();
  const record: FeedbackRecord = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString()
  };
  store.feedback.push(record);
  await writeStore(store);
  return record;
}

export async function getStoreStats() {
  const store = await ensureStore();
  return {
    sessionCount: store.sessions.length,
    feedbackCount: store.feedback.length
  };
}
