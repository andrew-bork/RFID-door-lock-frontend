import styles from './page.module.css'
import type { Selectable, User } from './common/types';

import type { ResponseType as GetUsersResponseType } from "@/pages/api/get-users";
import { UserListComponent } from './components/UserList';



export default function Home() {

  return (
    <main className={styles["main"]}>
      <div>
        <h1>RFID Door Lock Control Panel</h1>
        <UserListComponent />
      </div>
    </main>
  )
}
