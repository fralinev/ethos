"use client"

import { GrFormClose } from "react-icons/gr";
import { useRouter,  } from "next/navigation";

export default function SectionHeader({ text, closable }: { text: string | undefined, closable?: boolean }) {
  const router = useRouter();

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "rgb(28, 31, 35)",
        padding: "12px 20px"
      }}>
        <div>{text}</div>
        {closable &&
          <div
            onClick={() => router.push("/")}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <GrFormClose />
          </div>}


      </div>

    </div>
  )
}