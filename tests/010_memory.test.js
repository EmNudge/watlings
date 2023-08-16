import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports incrementData, doubleData", async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { mem: memory },
  });

  expect(instance.exports).toMatchObject({
    incrementData: expect.any(Function),
    doubleData: expect.any(Function),
  });
});

test("incrementData increments all numbers in range by 1", async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const buffer = new Uint8Array(memory.buffer);

  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { mem: memory },
  });

  const { incrementData } = instance.exports;

  incrementData(0, 20);
  expect([...buffer.slice(0, 20)]).toStrictEqual(Array(20).fill(1));

  incrementData(0, 20);
  expect([...buffer.slice(0, 20)]).toStrictEqual(Array(20).fill(2));

  incrementData(0, 20);
  expect([...buffer.slice(0, 21)]).toStrictEqual([...Array(20).fill(3), 0]);
});

test("doubleData doubles all numbers in range", async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const buffer = new Uint8Array(memory.buffer);

  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { mem: memory },
  });

  const { doubleData } = instance.exports;

  doubleData(0, 20);
  expect([...buffer.slice(0, 20)]).toStrictEqual(Array(20).fill(0));
  
  for (let i = 0; i < 20; i++) buffer[i] = 4;
  doubleData(0, 20);
  expect([...buffer.slice(0, 20)]).toStrictEqual(Array(20).fill(8));
});