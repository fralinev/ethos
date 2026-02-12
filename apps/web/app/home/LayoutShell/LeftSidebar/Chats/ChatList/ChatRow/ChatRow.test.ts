import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Chat, User } from "@ethos/shared";
import ChatRow from "./ChatRow";

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

vi.mock("@/apps/web/app/context/UserContext", () => ({
  useUser: () => ({
    id: "10",
    username: "xab",
    role: "user",
  }),
}));

const mkUser = (id: string, username: string): User => ({
  id,
  username,
  created_at: "2026-01-01T00:00:00.000Z",
  role: "user",
});

const baseChat: Chat = {
  id: "1",
  subject: "circus",
  type: "group",
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: { id: "10", username: "alice" },
  members: [mkUser("10", "xab"), mkUser("11", "nargol"), mkUser("16", "gol")],
};

function renderChatRow(overrides: Partial<React.ComponentProps<typeof ChatRow>> = {}) {
  const getChat = vi.fn();
  const setOpenId = vi.fn();
  const onLeave = vi.fn();
  const onRename = vi.fn();

  const props: React.ComponentProps<typeof ChatRow> = {
    chat: baseChat,
    getChat,
    activeTab: "group",
    openId: null,
    setOpenId,
    onLeave,
    onRename,
    ...overrides,
  };

  render(React.createElement(ChatRow, props));

  return {
    props,
    getChat,
    setOpenId,
    onLeave,
    onRename,
  };
}

describe("ChatRow", () => {
  it("calls getChat with chat id when row name is clicked", () => {
    const { getChat } = renderChatRow();
    fireEvent.click(screen.getByText("circus"));
    expect(getChat).toHaveBeenCalledWith("1");
  });

  it("renders subject when present", () => {
    renderChatRow()
    expect(screen.getByText("circus")).toBeTruthy();
  })

  it("renders member usernames when subject is missing", () => {
    renderChatRow({
      chat: {
        ...baseChat,
        subject: null,
      },
    });
    expect(screen.getByText("nargol, gol")).toBeTruthy();
  });

  it("shows dropdown actions and triggers callbacks when open", () => {
    const { onRename, onLeave } = renderChatRow({ openId: "1" });
    fireEvent.click(screen.getByText("Change Subject"));
    fireEvent.click(screen.getByText("Leave Chat"));
    expect(onRename).toHaveBeenCalledWith(baseChat);
    expect(onLeave).toHaveBeenCalledWith(baseChat);
  });
});
