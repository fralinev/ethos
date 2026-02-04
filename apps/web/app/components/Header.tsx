import LogoutButton from "./LogoutButton";
import styles from "./header.module.css"
import { getSessionFromNextRequest } from "../../lib/session";
import { GiHamburgerMenu } from "react-icons/gi";
import HeaderMenu from "./HeaderMenu";
import HeaderLogin from "./HeaderLogin";


export default async function Header() {
  const session = await getSessionFromNextRequest();

  return (
    <div>
      <div className={styles.header}>
         <div className={styles.left}>
        <span>E T H O S</span>
      </div>

      <div className={styles.right}>
        {/* <LogoutButton session={session}/> */}
        {session?.user && <HeaderMenu session={session}/>}
        {/* {!session?.user &&  <HeaderLogin/>} */}
        {/* <HeaderMenu/> */}
        

      </div>
      </div>
    </div>
  )
}