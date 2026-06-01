import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Chat, SessionData, SocketMessage } from "@ethos/shared";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

type SocketClientLike = {
  onMessage: (handler: (msg: SocketMessage) => void) => () => void;
};

type UseChatSocketEventsInput = {
  client: SocketClientLike | null;
  session: SessionData | undefined;
  activeChatId: string | undefined;
  activeChatIdRef: MutableRefObject<string | undefined>;
  setChats: (updater: (prev: Chat[]) => Chat[]) => void;
  setActiveTab: Dispatch<SetStateAction<string>>;
};

export function useChatSocketEvents({
  client,
  session,
  activeChatId,
  activeChatIdRef,
  setChats,
  setActiveTab,
}: UseChatSocketEventsInput) {
  const router = useRouter();

  useEffect(() => {
    if (!client) return;
    const off = client.onMessage((msg: SocketMessage) => {
      if (!msg) return;
      switch (msg.type) {
        case "chat:created": {
          const newChat: Chat = msg.payload;
          setChats((prev: Chat[]) => {
            if (prev.some((c) => c.id === newChat.id)) return prev;
            return [...prev, newChat];
          });
          setActiveTab(msg.payload.type);
          if (session?.userId && msg.payload.createdBy.id === session.userId) {
            router.push(`/home?chatId=${newChat.id}`);
          }
          break;
        }
        case "chat:renamed": {
          const { chatId, newSubject } = msg.payload;
          if (chatId === activeChatIdRef.current) {
            router.push(`/home?chatId=${chatId}`);
          } else {
            setChats((prev: Chat[]) => {
              const targetId = chatId;
              return prev.map((c) =>
                c.id === targetId
                  ? { ...c, subject: newSubject }
                  : c
              );
            });
          }
          break;
        }
        case "chat:left": {
          if (session?.userId === msg.payload.leftBy) {
            if (activeChatId === msg.payload.chatId) {
              router.push("/home");
            } else {
              setChats((prev: Chat[]) => {
                return prev.filter((chat: Chat) => chat.id !== msg.payload.chatId);
              });
            }
          }
          break;
        }
        default:
          break;
      }
    });

    return () => off();
  }, [activeChatId, activeChatIdRef, client, router, session?.userId, setActiveTab, setChats]);
}
