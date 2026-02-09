const STORAGE_KEY = "watlings-progress";
const DRAFTS_KEY = "watlings-drafts";

let progressCache: Set<string> | null = null;

function getProgress(): Set<string> {
  if (progressCache) return progressCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (progressCache = new Set(JSON.parse(raw)));
  } catch {
    // ignore
  }
  return (progressCache = new Set());
}

function saveProgress(completed: Set<string>) {
  progressCache = completed;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function isCompleted(chapterId: string, lessonId: string): boolean {
  return getProgress().has(`${chapterId}/${lessonId}`);
}

export function markCompleted(chapterId: string, lessonId: string) {
  const progress = getProgress();
  progress.add(`${chapterId}/${lessonId}`);
  saveProgress(progress);
}

// ── Draft persistence ─────────────────────────────────────────────────

interface Draft {
  code: string;
  exerciseHash: string;
  hostCode?: string;
}

function getDrafts(): Record<string, Draft> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export async function hashCode(code: string): Promise<string> {
  const encoded = new TextEncoder().encode(code);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function saveDraft(
  chapterId: string,
  lessonId: string,
  code: string,
  exerciseHash: string,
  hostCode?: string,
) {
  const drafts = getDrafts();
  const key = `${chapterId}/${lessonId}`;
  drafts[key] = { code, exerciseHash, ...(hostCode != null && { hostCode }) };
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function loadDraft(
  chapterId: string,
  lessonId: string,
  exerciseHash: string,
): { code: string; hostCode?: string } | null {
  const drafts = getDrafts();
  const draft = drafts[`${chapterId}/${lessonId}`];
  if (draft && draft.exerciseHash === exerciseHash) {
    return { code: draft.code, ...(draft.hostCode != null && { hostCode: draft.hostCode }) };
  }
  return null;
}
