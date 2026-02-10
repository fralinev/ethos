


export const getMessages = async (userId: string, activeChatId: string) => {
  if (userId && activeChatId) {
    try {
      const response = await fetch(`/api/chats/${activeChatId}`,
        {
          headers: {"x-user-id": userId,},
          cache: "no-store",
        }
      );
      if (!response.ok) console.error(response.status, response.statusText)
      else {
        const data = await response.json();
        return data
      }
    } catch (err) {
      console.error(err);
    }
  }
}
