import type { User } from "@ethos/shared";

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

export function getUsernames(members: User[], currentUserId: string): string {
  return members
    .reduce((acc: string[], curr: User) => {
      const { id, username } = curr;
      if (currentUserId !== id) acc.push(username);
      return acc;
    }, [])
    .join(", ");
}
