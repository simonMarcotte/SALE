export type PaddleKey = 'a' | 'l';
export const READY_AT = 0.72;
export type Rally = {
  x: number; from: number; to: number; progress: number;
  returns: number; duration: number; pause: number; misses: number;
};
export function createRally(): Rally {
  return { x: -1.6, from: -1.6, to: 1.6, progress: 0, returns: 0, duration: 1.8, pause: 0.5, misses: 0 };
}
export function receivingKey(rally: Rally): PaddleKey { return rally.to > 0 ? 'l' : 'a'; }
export function canReceive(rally: Rally): boolean {
  return rally.pause <= 0 && rally.progress >= READY_AT && rally.progress <= 1;
}
export function receiveRally(rally: Rally, key: PaddleKey): boolean {
  if (!canReceive(rally) || receivingKey(rally) !== key) return false;
  rally.returns += 1;
  rally.from = rally.x;
  rally.to = rally.to > 0 ? -1.6 : 1.6;
  rally.progress = 0;
  rally.duration = 1.8 / (1 + .025 * rally.returns);
  return true;
}
// True means the ball was missed; restart the rally after a short serve pause.
export function advanceRally(rally: Rally, dt: number): boolean {
  if (rally.pause > 0) { rally.pause = Math.max(0, rally.pause - dt); return false; }
  rally.progress += dt / rally.duration;
  if (rally.progress > 1) {
    const misses = rally.misses + 1;
    Object.assign(rally, createRally(), { misses, pause: 0.85 });
    return true;
  }
  rally.x = rally.from + (rally.to - rally.from) * rally.progress;
  return false;
}
