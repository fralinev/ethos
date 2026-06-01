"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { UserProvider } from "./UserContext"
import { useState } from "react"
import type { User } from "@ethos/shared"

export default function Providers({ user, children }: { user: User, children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider user={user}>
        {children}
      </UserProvider>
    </QueryClientProvider>
  )
}