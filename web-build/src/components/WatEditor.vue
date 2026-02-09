<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createEditor, type WatEditor } from "../editor";

const props = defineProps<{
  code: string;
}>();

const emit = defineEmits<{
  change: [code: string];
}>();

const container = ref<HTMLDivElement>();
let editor: WatEditor | null = null;

onMounted(async () => {
  if (container.value) {
    editor = await createEditor(container.value, props.code, (code) => emit("change", code));
  }
});

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});

defineExpose({
  getValue(): string {
    return editor?.getValue() ?? "";
  },
  setValue(code: string) {
    editor?.setValue(code);
  },
});
</script>

<template>
  <div ref="container" class="editor-container"></div>
</template>
