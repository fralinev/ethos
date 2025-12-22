export const throttle = (func: any, delay: number) => {
  let called: boolean = false;
  return function (...args: any) {
    if (!called) {
      called = true;
      func(...args);
      setTimeout(() => { called = false }, delay)
    }
  }
}