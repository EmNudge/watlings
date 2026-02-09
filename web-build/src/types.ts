export interface Lesson {
  id: string;
  title: string;
  instructionsHtml: string;
  exerciseCode: string;
  solutionCode: string;
  testCode: string;
  hasWasm: boolean;
  hostCode?: string;
  hostSolutionCode?: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface LessonsData {
  chapters: Chapter[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  errors: string[];
}

export interface ConsoleLine {
  type: "log" | "warn" | "error" | "info";
  text: string;
}
