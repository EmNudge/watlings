<script setup lang="ts">
import type { Chapter } from "../types";
import { isCompleted } from "../progress";

defineProps<{
  chapters: Chapter[];
  currentChapterId: string | undefined;
  currentLessonId: string | undefined;
  collapsed: boolean;
}>();

const emit = defineEmits<{
  navigate: [chapterId: string, lessonId: string];
  toggleCollapse: [];
}>();
</script>

<template>
  <nav class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <span v-if="!collapsed" class="sidebar-title">Watlings</span>
      <a
        v-if="!collapsed"
        class="sidebar-github"
        href="https://github.com/EmNudge/watlings"
        target="_blank"
        rel="noopener noreferrer"
        title="View on GitHub"
      >
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </a>
      <button
        class="sidebar-toggle"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggleCollapse')"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <polyline v-if="collapsed" points="14,9 17,12 14,15" />
          <polyline v-else points="17,9 14,12 17,15" />
        </svg>
      </button>
    </div>
    <template v-if="!collapsed">
      <template v-for="chapter in chapters" :key="chapter.id">
        <div class="chapter-title">{{ chapter.title }}</div>
        <a
          v-for="lesson in chapter.lessons"
          :key="lesson.id"
          class="lesson-link"
          :class="{
            active: currentChapterId === chapter.id && currentLessonId === lesson.id,
          }"
          @click="emit('navigate', chapter.id, lesson.id)"
        >
          <span class="lesson-check">{{ isCompleted(chapter.id, lesson.id) ? "\u2713" : "" }}</span>
          {{ lesson.title }}
        </a>
      </template>
    </template>
  </nav>
</template>
