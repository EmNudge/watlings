<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import type { ConsoleLine, TestResult } from "./types";
import { useLessons } from "./composables/useLessons";
import { isCompleted, markCompleted, hashCode, saveDraft, loadDraft } from "./progress";
import { runTests, runHostPreview } from "./runner";
import { fireCelebration } from "./confetti";
import Sidebar from "./components/Sidebar.vue";
import WatEditor from "./components/WatEditor.vue";
import JsEditor from "./components/JsEditor.vue";

const { data, currentChapter, currentLesson, navigateTo, getAdjacentLesson } = useLessons();

const sidebarCollapsed = ref(false);
const editorRef = ref<InstanceType<typeof WatEditor>>();
const jsEditorRef = ref<InstanceType<typeof JsEditor>>();
const editorKey = ref(0);
const jsEditorKey = ref(0);
const initialCode = ref("");
const initialHostCode = ref("");
const activeTab = ref<"wat" | "js">("wat");
const currentExerciseHash = ref("");
const testResults = ref<TestResult[]>([]);
const running = ref(false);
const outputMessage = ref("Click \u201cRun Tests\u201d to test your solution.");
const sidebarVersion = ref(0);

const hasHostCode = computed(() => !!currentLesson.value?.hostCode);
const consoleOutput = ref<ConsoleLine[]>([]);
const consoleRunning = ref(false);

let previewTimer: ReturnType<typeof setTimeout> | null = null;
let previewGeneration = 0;

function schedulePreview() {
  if (!hasHostCode.value) return;
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(runPreview, 400);
}

async function runPreview() {
  const watCode = editorRef.value?.getValue() ?? "";
  const hostCode = jsEditorRef.value?.getValue() ?? "";
  if (!hostCode) return;

  const gen = ++previewGeneration;
  consoleRunning.value = true;

  try {
    const lines = await runHostPreview(watCode, hostCode);
    if (gen === previewGeneration) {
      consoleOutput.value = lines;
    }
  } finally {
    if (gen === previewGeneration) {
      consoleRunning.value = false;
    }
  }
}

const prevLesson = computed(() => getAdjacentLesson(-1));
const nextLesson = computed(() => getAdjacentLesson(1));
const allPassed = computed(
  () => testResults.value.length > 0 && testResults.value.every((r) => r.passed),
);

function saveCurrentDraft() {
  if (!currentChapter.value || !currentLesson.value || !currentExerciseHash.value) return;

  const code = editorRef.value?.getValue();
  if (code == null) return;

  const hostCode = jsEditorRef.value?.getValue();
  saveDraft(
    currentChapter.value.id,
    currentLesson.value.id,
    code,
    currentExerciseHash.value,
    hostCode ?? undefined,
  );
}

// When lesson changes: save draft for old lesson, load draft for new lesson, re-key editor
let prevChapterId: string | null = null;
let prevLessonId: string | null = null;

watch(
  currentLesson,
  async (newLesson) => {
    // Save draft for the PREVIOUS lesson (before IDs were updated)
    if (prevChapterId && prevLessonId && currentExerciseHash.value) {
      const code = editorRef.value?.getValue();
      if (code != null) {
        const hostCode = jsEditorRef.value?.getValue();
        saveDraft(
          prevChapterId,
          prevLessonId,
          code,
          currentExerciseHash.value,
          hostCode ?? undefined,
        );
      }
    }

    if (newLesson && currentChapter.value) {
      const hash = await hashCode(newLesson.exerciseCode);
      currentExerciseHash.value = hash;
      const draft = loadDraft(currentChapter.value.id, newLesson.id, hash);
      initialCode.value = draft?.code ?? newLesson.exerciseCode;
      initialHostCode.value = draft?.hostCode ?? newLesson.hostCode ?? "";
      prevChapterId = currentChapter.value.id;
      prevLessonId = newLesson.id;
    }

    activeTab.value = "wat";
    editorKey.value++;
    jsEditorKey.value++;
    testResults.value = [];
    consoleOutput.value = [];
    outputMessage.value = "Click \u201cRun Tests\u201d to test your solution.";

    // Run initial preview after editors mount
    if (newLesson?.hostCode) {
      await nextTick();
      schedulePreview();
    }
  },
  { immediate: true },
);

// Save draft on page unload
function onBeforeUnload() {
  saveCurrentDraft();
}
onMounted(() => window.addEventListener("beforeunload", onBeforeUnload));
onBeforeUnmount(() => window.removeEventListener("beforeunload", onBeforeUnload));

async function handleRunTests() {
  if (!currentLesson.value || !currentChapter.value) return;

  running.value = true;
  testResults.value = [];
  outputMessage.value = "Running tests...";

  try {
    await nextTick();
    const code = editorRef.value?.getValue() ?? "";
    const hostCode = jsEditorRef.value?.getValue() || undefined;
    const results = await runTests(
      code,
      currentLesson.value.testCode,
      currentLesson.value.hasWasm,
      hostCode,
    );
    testResults.value = results;
    outputMessage.value = "";

    if (results.every((r) => r.passed) && results.length > 0) {
      markCompleted(currentChapter.value.id, currentLesson.value.id);
      fireCelebration();
      sidebarVersion.value++;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    testResults.value = [];
    outputMessage.value = msg;
  } finally {
    running.value = false;
  }
}

function handleReset() {
  if (currentLesson.value) {
    editorRef.value?.setValue(currentLesson.value.exerciseCode);
    if (currentLesson.value.hostCode) {
      jsEditorRef.value?.setValue(currentLesson.value.hostCode);
    }
  }
}

function handleShowSolution() {
  if (currentLesson.value) {
    editorRef.value?.setValue(currentLesson.value.solutionCode);
    if (currentLesson.value.hostSolutionCode) {
      jsEditorRef.value?.setValue(currentLesson.value.hostSolutionCode);
    }
  }
}

function handlePrev() {
  const prev = prevLesson.value;
  if (prev) navigateTo(prev.chapterId, prev.lessonId);
}

function handleNext() {
  const next = nextLesson.value;
  if (next) navigateTo(next.chapterId, next.lessonId);
}

// When sidebar collapses/expands, preserve the editor panel width
const isDragging = ref(false);

watch(sidebarCollapsed, (collapsed) => {
  if (!appEl.value) return;

  const editorPanel = appEl.value.querySelector(".editor-panel") as HTMLElement;
  const editorWidth = editorPanel?.getBoundingClientRect().width;
  appEl.value.style.gridTemplateColumns = "";
  if (editorWidth) {
    const col1 = collapsed ? "40px" : "var(--sidebar-width)";
    appEl.value.style.gridTemplateColumns = `${col1} 1fr 5px ${editorWidth}px`;
  }
});

// Drag handle resize
const appEl = ref<HTMLDivElement>();

function onDragStart(e: MouseEvent) {
  e.preventDefault();
  const handle = e.currentTarget as HTMLElement;
  handle.classList.add("dragging");
  isDragging.value = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  function cleanup() {
    handle.classList.remove("dragging");
    isDragging.value = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", cleanup);
  }

  function onMove(ev: MouseEvent) {
    if (!appEl.value) return;

    const sidebar = appEl.value.querySelector(".sidebar") as HTMLElement;
    if (!sidebar) return;

    const sidebarWidth = sidebar.getBoundingClientRect().width;
    const instructionsWidth = ev.clientX - sidebarWidth;

    // Auto-collapse sidebar when instructions panel is squeezed to its minimum
    if (instructionsWidth < 200 && !sidebarCollapsed.value) {
      sidebarCollapsed.value = true;
    }

    const col1 = sidebarCollapsed.value ? "40px" : `${sidebarWidth}px`;
    const adjustedX = sidebarCollapsed.value ? ev.clientX - 40 : instructionsWidth;
    appEl.value.style.gridTemplateColumns = `${col1} ${Math.max(150, adjustedX)}px 5px 1fr`;
  }

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", cleanup);
}
</script>

<template>
  <div v-if="!data" class="loading">Loading lessons...</div>
  <div
    v-else-if="currentLesson && currentChapter"
    ref="appEl"
    class="app-grid"
    :class="{ 'sidebar-collapsed': sidebarCollapsed, dragging: isDragging }"
  >
    <Sidebar
      :key="sidebarVersion"
      :chapters="data.chapters"
      :current-chapter-id="currentChapter.id"
      :current-lesson-id="currentLesson.id"
      :collapsed="sidebarCollapsed"
      @navigate="navigateTo"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />
    <div class="instructions">
      <div class="instructions-content">
        <h1>{{ currentLesson.title }}</h1>
        <div v-html="currentLesson.instructionsHtml"></div>
      </div>
      <div class="instructions-nav">
        <button class="btn btn-secondary" :disabled="!prevLesson" @click="handlePrev">
          &larr; Prev
        </button>
        <button class="btn btn-secondary" :disabled="!nextLesson" @click="handleNext">
          Next &rarr;
        </button>
      </div>
    </div>
    <div class="drag-handle" @mousedown="onDragStart"></div>
    <div class="editor-panel">
      <div class="editor-toolbar">
        <button class="btn btn-primary" :disabled="running" @click="handleRunTests">
          {{ running ? "Running..." : "Run Tests" }}
        </button>
        <button class="btn btn-secondary" @click="handleReset">Reset</button>
        <button class="btn btn-secondary" @click="handleShowSolution">Show Solution</button>
        <div class="toolbar-spacer"></div>
        <button class="btn btn-secondary" :disabled="!prevLesson" @click="handlePrev">Prev</button>
        <button class="btn btn-secondary" :disabled="!nextLesson" @click="handleNext">Next</button>
      </div>
      <div v-if="hasHostCode" class="editor-tabs">
        <button
          class="editor-tab"
          :class="{ active: activeTab === 'wat' }"
          @click="activeTab = 'wat'"
        >
          module.wat
        </button>
        <button
          class="editor-tab"
          :class="{ active: activeTab === 'js' }"
          @click="activeTab = 'js'"
        >
          host.js
        </button>
      </div>
      <WatEditor
        v-show="activeTab === 'wat'"
        v-if="initialCode"
        :key="editorKey"
        ref="editorRef"
        :code="initialCode"
        @change="schedulePreview"
      />
      <JsEditor
        v-show="activeTab === 'js'"
        v-if="initialHostCode"
        :key="jsEditorKey"
        ref="jsEditorRef"
        :code="initialHostCode"
        @change="schedulePreview"
      />
      <div v-if="hasHostCode" class="console-panel">
        <div class="output-title">Console</div>
        <template v-if="consoleOutput.length > 0">
          <div
            v-for="(line, i) in consoleOutput"
            :key="i"
            class="console-line"
            :class="'console-' + line.type"
          >
            {{ line.text }}
          </div>
        </template>
        <div v-else class="console-empty">
          {{ consoleRunning ? "Running..." : "Output will appear here as you edit." }}
        </div>
      </div>
      <div class="output-panel">
        <div class="output-title">
          {{ testResults.length > 0 ? "Test Results" : "Output" }}
        </div>
        <template v-if="testResults.length > 0">
          <div
            v-for="(r, i) in testResults"
            :key="i"
            class="test-result"
            :class="r.passed ? 'test-pass' : 'test-fail'"
          >
            {{ r.passed ? "\u2713" : "\u2718" }} {{ r.name }}
            <div v-for="(err, j) in r.errors" :key="j" class="test-error">&middot; {{ err }}</div>
          </div>
          <div class="output-summary" :class="allPassed ? 'success' : 'failure'">
            {{ allPassed ? "All tests passed!" : "Some tests failed." }}
          </div>
        </template>
        <div v-else style="color: var(--text-dim); font-size: 13px">
          {{ outputMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
