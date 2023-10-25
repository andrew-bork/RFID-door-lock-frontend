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


function ScopeList({ scopes, setScopes, setHoveredScope }: { scopes: Selectable<string>[], setScopes: (newScopes:Selectable<string>[]) => void, setHoveredScope: (newHoveredScope:string) => void}) {

  const allSelected = !scopes.some((scope) => !scope.selected);

  return <table className={styles["scope-list"]}>
    <thead>
      <tr>
        <td>
          <input type="checkbox" 
            checked={allSelected}
            onChange={() => {
              setScopes(scopes.map((scope) => {
                return {
                  selected: !allSelected,
                  item: scope.item,
                };
            }));
          }}/>
        </td>
        <td>Scopes</td>
      </tr>
    </thead>
    <tbody onMouseLeave={() => {setHoveredScope("");}}>
      {scopes.map((scope, i) => {
        return <tr key={i} onMouseEnter={() => {setHoveredScope(scope.item);}}>
          <td>
            <input type="checkbox" 
              checked={scope.selected} 
              onChange={() => {
                const newScopes = scopes.map((scope, j) => {
                  if(i ==j) return { selected: !scope.selected, item: scope.item };
                  return scope;
                });

                setScopes(newScopes);
              }}
            />
          </td>
          <td>{scope.item}</td>
        </tr>
      })}
    </tbody>
  </table>
}



export default function Home() {
  
  const [ userList, setUserList ] = useState<Selectable<User>[]>([]);
  const [ scopes, setScopes ] = useState<Selectable<string>[]>([]);

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
          
          setScopes(scopes.map((scope) => ({
            selected: true,
            item: scope,
          })));

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
        <ScopeList scopes={scopes} setScopes={setScopes} setHoveredScope={setHoveredScope}/>
        <input className={styles["scope-text-input"]} placeholder="Scopes"/>
        <button>Add scope</button>
        <UserListComponent userList={userList} setUserList={setUserList} scopes={scopes} hoveredScope={hoveredScope}/>
      </div>
    </main>
  )
}
