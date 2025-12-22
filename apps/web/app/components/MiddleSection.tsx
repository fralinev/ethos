"use client"
import { useEffect } from "react";
import ChatTranscript from "./ChatTranscript"
import About from "./About"
import { SessionData } from "../../lib/session";
import { AuthedSession } from "../page";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import Spinner from "./Spinner";
import { finishChatLoading } from "../../store/slices/chatSlice";


export default function MiddleSection({ activeChatId, session, chatName }: { activeChatId: string | undefined, session: any, chatName: any }) {
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
      : <About />
  }

  return (
    <>
      {activeChatId && isAuthedSession(session) && <ChatTranscript
        session={session}
        activeChatId={activeChatId}
        chatName={chatName}
      /> }
    </>
  )
}