import { ref, shallowRef, computed } from "vue";
import type { LessonsData, Chapter, Lesson } from "../types";

interface Route {
  chapterId: string;
  lessonId: string;
}

function parsePathname(): Route | null {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length === 2 ? { chapterId: parts[0]!, lessonId: parts[1]! } : null;
}

const data = shallowRef<LessonsData | null>(null);
const currentChapter = ref<Chapter | null>(null);
const currentLesson = ref<Lesson | null>(null);

const flatLessons = computed(() =>
  (data.value?.chapters ?? []).flatMap((ch) =>
    ch.lessons.map((l) => ({ chapterId: ch.id, lessonId: l.id })),
  ),
);

function findLesson(
  chapterId: string,
  lessonId: string,
): { chapter: Chapter; lesson: Lesson } | null {
  const chapter = data.value?.chapters.find((c) => c.id === chapterId);
  const lesson = chapter?.lessons.find((l) => l.id === lessonId);
  return chapter && lesson ? { chapter, lesson } : null;
}

function navigateTo(chapterId: string, lessonId: string) {
  const found = findLesson(chapterId, lessonId);
  if (!found) return;

  currentChapter.value = found.chapter;
  currentLesson.value = found.lesson;
  window.history.pushState(null, "", `/${chapterId}/${lessonId}`);
}

function getAdjacentLesson(direction: -1 | 1): Route | null {
  if (!currentChapter.value || !currentLesson.value) return null;

  const idx = flatLessons.value.findIndex(
    (e) => e.chapterId === currentChapter.value!.id && e.lessonId === currentLesson.value!.id,
  );
  return flatLessons.value[idx + direction] ?? null;
}

function init(lessonsData: LessonsData) {
  data.value = lessonsData;

  window.addEventListener("popstate", () => {
    const route = parsePathname();
    if (!route) return;

    const found = findLesson(route.chapterId, route.lessonId);
    if (!found) return;

    currentChapter.value = found.chapter;
    currentLesson.value = found.lesson;
  });

  const route = parsePathname();
  if (route && findLesson(route.chapterId, route.lessonId)) {
    navigateTo(route.chapterId, route.lessonId);
  } else {
    const firstChapter = lessonsData.chapters[0];
    const firstLesson = firstChapter?.lessons[0];
    if (firstChapter && firstLesson) navigateTo(firstChapter.id, firstLesson.id);
  }
}

export function useLessons() {
  return { data, currentChapter, currentLesson, navigateTo, getAdjacentLesson, init };
}
