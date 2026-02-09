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
