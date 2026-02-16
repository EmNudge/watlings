import confetti from "canvas-confetti";

export function fireCelebration() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    zIndex: 10000,
  });
}
