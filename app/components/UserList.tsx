import styles from '@/app/page.module.css'
import type { Selectable, User } from '@/app/common/types';

interface UserListComponentProps {
    userList: Selectable<User>[],
    setUserList: (newUserList:Selectable<User>[]) => void,
    scopes: Selectable<string>[],
    hoveredScope: string,
}
  
export function UserListComponent({ userList, setUserList, scopes, hoveredScope } : UserListComponentProps) {



    const tableElements = userList.map((user, i) => {
        return <tr key={user.item._id}>
            <td className={styles["check-box-cell"]}>
                {/* Checkbox */}
                <input type="checkbox"
                    checked={user.selected} 
                    onChange={() => {
                        const newUserList = userList.map((user, j) => {
                            if(i ==j) return { selected: !user.selected, item: user.item };
                            return user;
                        });

                        setUserList(newUserList);
                    }}/>
            </td>
            <td>
                {user.item.name}
            </td>
            {
                scopes.filter((scope) => scope.selected).map((scopeName, i) => {
                    const scope = user.item.scopes.find((scope) => scope.scope === scopeName.item);
                    if(scope == null)
                        return <td key={i}> -- </td>

                    const expirationDate = new Date(scope.expires_at);
                    if(expirationDate.getFullYear() > 275750) {
                        return <td key={i} className={styles["non-expired-cell"]}>Never</td>
                    }

                    if(expirationDate < new Date()) {
                        return <td key={i} className={styles["expired-cell"]}>{expirationDate.toLocaleDateString()}</td>
                    }

                    return <td key={i} className={styles["non-expired-cell"]}>{expirationDate.toLocaleDateString()}</td>
                })
            }
            <td></td>
        </tr>
    });
  
    const allSelected = !userList.some((user) => !user.selected);

    return <table className={styles["user-list"]}>
        <thead>
            <tr>
                <td className={styles["check-box-cell"]}><input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={()=> {
                        setUserList(userList.map((user) => {
                            return {
                                selected: !allSelected,
                                item: user.item,
                            };
                        }));
                    }}

                /></td>
                <td className={styles["name-cell"]}>Name</td>
                {
                    scopes.filter((scope) => scope.selected).map((scope, i) => {
                        return <td key={i} className={styles["name-cell"]}>{scope.item}</td>
                    })
                }
                <td></td>
            </tr>
            </thead>
        <tbody>
            {tableElements}
        </tbody>

        <colgroup>
            <col/>
            <col/>
            {
                scopes.filter((scope) => scope.selected).map((scope, i) => {
                    let className = "";
                    if(scope.item == hoveredScope) className = styles["hovered-scope-col"];
                    return <col key={i} className={className}></col>
                })
            }
            <col/>
        </colgroup>
    </table>;
}
  
  
  