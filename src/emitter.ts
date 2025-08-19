export class Emitter {
  private evt: Record<string, Function[]> = {};

  on(name: string, cb: (...args: any[]) => void) {
    (this.evt[name] ||= []).push(cb);
    return () => this.off(name, cb);
  }

  off(name: string, cb: (...args: any[]) => void) {
    this.evt[name] = (this.evt[name] || []).filter((fn) => fn !== cb);
  }

  emit(name: string, ...args: any[]) {
    (this.evt[name] || []).forEach((fn) => {
      try {
        fn(...args);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
