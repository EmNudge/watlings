// This incredibly strange fix for async function context was contributed
// by laquasicinque. I would have never been able to figure this out.

const contextMap = new Map();

export function getContext() {
  try {
    throw new Error();
  } catch (e) {
    const key = e.stack.match(/🫨🫨.+?🫨🫨/)?.[0];
    return contextMap.get(key);
  }
}

/** @param {any} value @param {() => Promise<any>} func */
export async function createContext(value, func) {
  const key = "🫨🫨" + Math.random().toString(16) + "🫨🫨";
  contextMap.set(key, value);

  const fn = {
    async [key]() {
      return await func();
    },
  }[key];
  await fn();
  contextMap.delete(key);
}
