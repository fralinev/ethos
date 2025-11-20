"use client"

import { SessionUser } from "@/packages/shared/session"
import { useState, useEffect } from "react"

export default function Badge({username}:{username:string | SessionUser | undefined}) {
    const [user, setUser] = useState<any>(null)
    useEffect(() => {
        setUser(username)
    }, [username])
    return (
        <div>
            <div>{user}</div>
        </div>
    )
}