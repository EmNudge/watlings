import confetti from "canvas-confetti";

export function fireCelebration() {
  const end = Date.now() + 1500;

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      zIndex: 10000,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      zIndex: 10000,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }

  frame();
}
