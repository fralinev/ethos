"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ChatList({ chats }: { chats: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");

  const handleChatClick = (chatId: number) => {
    router.push(`/?chatId=${chatId}`);
  };

  return (
    <div>
      <div>CHATLIST</div>

      <div>
        {chats.map((c) => {
          const isSelected = currentChatId === c.id.toString();

          return (
            <div
              key={c.id}
              onClick={() => handleChatClick(c.id)}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                background: isSelected ? "#e0e0e0" : "transparent",
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              {c.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
