import styles from './page.module.css'
import type { Selectable, User } from './common/types';

import { UserListComponent } from './components/UserList';
import { AccessLogs } from './components/AccessLogs';



export default function Home() {

  return (
    <main className={styles["main"]}>
      <div>
        <h1>RFID Door Lock Control Panel</h1>
        <UserListComponent />
        <AccessLogs />
      </div>
    </main>
  )
}
