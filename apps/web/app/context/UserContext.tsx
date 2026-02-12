"use client"

import { createContext, useContext } from "react";
import type {User} from "@ethos/shared"

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }:any) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
