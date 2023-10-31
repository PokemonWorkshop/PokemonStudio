export default class DelayedFunction {
  delay: number;

  timeoutId: number | undefined;

  fn?: () => void;

  constructor(delay: number) {
    this.delay = delay;
  }

  start(fn: () => void) {
    this.stop();
    this.timeoutId = window.setTimeout(fn, this.delay);
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
