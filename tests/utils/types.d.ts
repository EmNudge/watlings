export type ObjectShape = {
  [key: string]:
    | FunctionConstructor
    | ObjectConstructor
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | { new (descriptor: any): WebAssembly.Memory; prototype: WebAssembly.Memory; }
    | ObjectShape;
};

declare global {
  interface WebAssembly {
    Exports: Record<string, any>;
  }
}