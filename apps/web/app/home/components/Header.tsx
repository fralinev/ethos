
"use client"
import styles from "./header.module.css"
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import { useRouter } from "next/navigation";


export default function Header() {
  const router = useRouter();


  return (
    <div>
      <div className={styles.header} >
        <div className={styles.left} onClick={() => router.push("/")}>
          <Logo fontSize={20} svgSize={25} color="black" />
        </div>
        <div className={styles.right}>
          <HeaderMenu />
        </div>
      </div>
    </div>
  )
}