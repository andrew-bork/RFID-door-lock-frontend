"use client"

import styles from './page.module.css'
import { useEffect, useState } from "react";
import type { Selectable, User } from './common/types';

import type { ResponseType as GetUsersResponseType } from "@/pages/api/get-users";
import { UserListComponent } from './components/UserList';



function enumerateScopes(userList:User[]) : string[]{
  const scopes : Set<string> = new Set();

  userList.forEach((user) => {
      user.scopes.forEach((scope) => {
          scopes.add(scope.scope);
      });
  });

  return Array.from(scopes);
}

interface AddScopeComponent {

};

function AddScopeComponent({} : AddScopeComponent) {
  return <div>
      <input className={styles["scope-text-input"]} placeholder="Scopes"/>
      <input type="date"/>
      <button>Add scope</button>
    </div>
}

export default function Home() {
  
  const [ userList, setUserList ] = useState<Selectable<User>[]>([]);
  const [ scopes, setScopes ] = useState<string[]>([]);

  const [ hoveredScope, setHoveredScope ] = useState<string>("");

  useEffect(() => {

    fetch("/api/get-users", { method: "GET" })
      .then((response) => response.json())
      .then((response : GetUsersResponseType) => {
        if(response.success) {
          setUserList(response.users.map((user) => ({
            selected: false,
            item: user,
          })));

          const scopes = enumerateScopes(response.users);
          
          setScopes(scopes);

        }else {
          console.error(response.message);
        }
      })
      .catch((error) => console.log(error));

    return () => {};
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.description}>

        <h1>RFID Door Lock Control Panel</h1>
        <AddScopeComponent/>
        <UserListComponent userList={userList} setUserList={setUserList} scopes={scopes} hoveredScope={hoveredScope}/>
      </div>
    </main>
  )
}
