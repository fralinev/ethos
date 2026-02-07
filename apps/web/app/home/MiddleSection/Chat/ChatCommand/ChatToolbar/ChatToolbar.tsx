"use client"
import styles from "./ChatToolbar.module.css"
import { IoIosAddCircle } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { MdDownload } from "react-icons/md";
import Tooltip from "@/apps/web/app/Tooltip";



export default function ChatToolbar() {
  return (
    <div className={styles.chatToolbar}>
      <Tooltip text="Add user to chat">
        <div style={{cursor: "pointer"}}><IoIosAddCircle size={30} /></div>

      </Tooltip>
      <div><BsEmojiSmile size={25} /></div>
      <div><MdDownload size={25} /></div>
    </div>
  )
}