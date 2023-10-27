"use client"

import styles from './UserList.module.css'
import type { Selectable, User } from '@/app/common/types'; 
import { useEffect, useRef, useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import SaveIcon from '@mui/icons-material/Save';
// import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer } from "@mui/x-data-grid"


import type { ResponseType as CreateUserResponseType } from "@/pages/api/create-user";
import type { ResponseType as GetUsersResponseType } from "@/pages/api/get-users";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';



function enumerateScopes(userList:User[]) : string[]{
    const scopes : Set<string> = new Set();
  
    userList.forEach((user) => {
        user.scopes.forEach((scope) => {
            scopes.add(scope.scope);
        });
    });
  
    return Array.from(scopes);
}


interface UserListComponentProps {
}

  
export function UserListComponent({} : UserListComponentProps) {


    
  
    const [ userList, setUserList ] = useState<User[]>([]);
    const [ scopes, setScopes ] = useState<string[]>([]);


    const refresh = () => {
        fetch("/api/get-users", { method: "GET" })
        .then((response) => response.json())
        .then((response : GetUsersResponseType) => {
          if(response.success) {
            setUserList(response.users);
            console.log(response);
            const scopes = enumerateScopes(response.users);
            
            setScopes(scopes);
  
          }else {
            console.error(response.message);
          }
        })
        .catch((error) => console.log(error));
    };

    useEffect(() => {

        refresh();
    
        return () => {};
      }, []);


    
      function UserListEditBar() {

        const [ addingUser, setAddingUser ] = useState(false);
    
        const [ name, setName ] = useState("");
    
        function addUser() {
            // console.log(`/api/create-user?name=${name}`);
            fetch(`/api/create-user?name=${name}`)
                .then(res => res.json())
                .then((res : CreateUserResponseType) => {
                    if(res.success) {
                        refresh();
                    }
                });
        }
    
        return <GridToolbarContainer>
            <Button color="primary" onClick={()=>{refresh();}}>
                Refresh
            </Button>
            <Button color="primary" onClick={()=>{setAddingUser(true);}}>
                Add user
            </Button>
    
            <Dialog open={addingUser} onClose={()=>{setAddingUser(false);}}>
                <DialogTitle>Add a user</DialogTitle>
                <DialogContent>
                    <TextField value={name} onChange={(e) => {setName(e.target.value);}} autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard"/>    
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={()=>{setAddingUser(false);}}>Cancel</Button>
                    <Button onClick={()=>{setAddingUser(false);addUser();}}>Add</Button>
                </DialogActions>
            </Dialog>
    
        </GridToolbarContainer>
    }


    const rows: GridRowsProp = useMemo(() => {
        return userList.map((user) => {
            const row : {[x: string]: string|number|Date|null}= {
                id: user._id,
                name: user.name
            };
    
            scopes.forEach((scope) => {
                const userScope = user.scopes.find((userScope) => userScope.scope === scope);
                if(userScope == null) {
                    row[scope] = null;
                }else {
                    row[scope] = new Date(userScope.expires_at);
                }
            });
    
            return row;
        });
    }, [userList, scopes])
    

    const cols: GridColDef[] = useMemo(() => {
        const cols : GridColDef[] = [{ 
                field: "name", 
                width: 250,
                renderHeader() {
                    return <strong>Name</strong>
                }
            }];

        scopes.forEach((scope) => {
            cols.push({ 
                field: scope,  
                width: 200,
                renderHeader() {
                    return <strong>{scope}</strong>
                },
                cellClassName(props) {
                    if(props.value == null) return "";
                    const expirationDate = props.value as Date;
                    const now = new Date();
                    if(expirationDate < now) {
                        return styles["cell-expired"];
                    }else {
                        return styles["cell-valid"];
                    }
                },
                renderCell(props) {
                    if(props.value == null) return <>--</>
                    const expirationDate = props.value as Date;
                    const never = new Date(8640000000000000);
                    if(never <= expirationDate) return <>Never</>
                    return <>{expirationDate.toLocaleDateString()}</>
                }
            });
        });

        return cols;
    }, [scopes]);

    return <Box
        sx={{
            width: '90%',
            '& .actions': {
              color: 'text.secondary',
            },
            '& .textPrimary': {
              color: 'text.primary',
            },
          }}>
          <DataGrid 
              slots={{
                  toolbar: UserListEditBar
              }}    
              checkboxSelection rows={rows} columns={cols}/>
        </Box>
}
  
  
  