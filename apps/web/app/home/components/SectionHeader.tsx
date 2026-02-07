"use client"

import { GrFormClose } from "react-icons/gr";
import { useRouter, } from "next/navigation";

export default function SectionHeader({ text, onClose }: { text: string | undefined, onClose?: () => void }) {
  const router = useRouter();

  return (
    // <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "rgb(28, 31, 35)",
        padding: "12px 20px",
        width: "100%"
      }}>
        <div>{text}</div>
        {onClose &&
          <div
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <GrFormClose />
          </div>}


      {/* </div> */}

    </div>
  )
}