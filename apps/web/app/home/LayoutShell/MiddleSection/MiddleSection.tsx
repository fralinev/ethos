"use client"
import { useEffect } from "react";
import { SessionData, AuthedSession } from "@ethos/shared";
import { useAppSelector, useAppDispatch } from "@/apps/web/store/hooks"
import Spinner from "../../components/Spinner";
import { finishChatLoading } from "@/apps/web/store/slices/chatSlice";
import Chat from "./Chat/Chat";


export default function MiddleSection({ activeChatId, session }: { activeChatId: string | undefined, session: any }) {
  const dispatch = useAppDispatch();
  const isChatLoading = useAppSelector((s) => s.ui.isChatLoading);

useEffect(() => {
    if (!session?.user || !activeChatId) {
      dispatch(finishChatLoading())
    }
    return
  }, [activeChatId])

  // type guard
  function isAuthedSession(
    session: SessionData | undefined
  ): session is AuthedSession {
    return !!session?.user;
  }
  // When a user clicks on a chat and there is no active chat, i.e. 
  // from the home/about page, show the spinner immediately
  if (!session?.user || !activeChatId) {
    return isChatLoading
      ? <Spinner size={60} />
      : null
  }

  return (
    <>
      {activeChatId && isAuthedSession(session) && <Chat
        session={session}
        activeChatId={activeChatId}
      /> }
    </>
  )
}