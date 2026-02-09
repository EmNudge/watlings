import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import type { LessonsData } from "./types";
import { useLessons } from "./composables/useLessons";

async function main() {
  const lessonsData: LessonsData = await import("./lessons.json");
  const { init } = useLessons();
  init(lessonsData);

  createApp(App).mount("#app");
}

main();
