import { FaSearch } from "react-icons/fa";
import styles from "./UsersSearch.module.css"

export default function UsersSearch({query, onSearch}:{query: any, onSearch: any}) {
  return (
    <div className={styles.usersSearch}>
      <input type="text" value={query} onChange={(ev) => onSearch(ev.target.value)}/>
      <FaSearch className={styles.searchIcon} />
    </div>
  )
}
