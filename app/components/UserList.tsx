"use client"

import styles from './UserList.module.css'
import type { Selectable, User } from '../common/types'; 
import { useEffect, useRef, useState, useMemo, SyntheticEvent, ChangeEventHandler } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import SaveIcon from '@mui/icons-material/Save';
// import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridColDef, GridRowModes, GridRowModesModel, GridRowSelectionModel, GridRowsProp, GridToolbarContainer, useGridApiContext } from "@mui/x-data-grid"


import type { ResponseType as CreateUserResponseType } from "@/pages/api/create-user";
import type { ResponseType as GetUsersResponseType } from "@/pages/api/get-users";
import type { ResponseType as DeleteUsersResponseType } from "@/pages/api/delete-users";
import type { ResponseType as RemoveScopeResponseType  } from '@/pages/api/remove-scope';
import type { ResponseType as AddScopeResponseType  } from '@/pages/api/add-scope';

import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormGroup, InputLabel, TextField, ButtonGroup, Grid, Typography, Popper, Input } from '@mui/material';
import { validateName, validateScope } from '../common/validate';
import { Delete, Edit } from '@mui/icons-material';



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


    const [ rowModesModel, setRowModesModel ] = useState<GridRowModesModel>({});
    const [ rowSelectionModel, setRowSelectionModel ] = useState<GridRowSelectionModel>([]);
    const [ selectingDate, setSelectingDate ] = useState(false);
    const [ selectedDate, setSelectedDate ] = useState(new Date());
    const [ cellBeingEdited, setCellBeingEdited ] = useState({ id: "", scope: ""});

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
        const [ deletingUsers, setDeletingUsers ] = useState(false);
        const [ creatingScope, setCreatingScope ] = useState(false);
    
        const [ name, setName ] = useState("");
        const [ scope, setScope ] = useState("");
    
        function addUser() {
            // console.log(`/api/create-user?name=${name}`);
            fetch(`/api/create-user?name=${name}`)
                .then(res => res.json())
                .then((res : CreateUserResponseType) => {
                    console.log(res);
                    if(res.success) {
                        refresh();
                    }
                });
        }

        function deleteUsers() {
            fetch(`/api/delete-users?ids=${rowSelectionModel.join("+")}`, { method: "POST" })
                .then(res => res.json())
                .then((res : DeleteUsersResponseType) => {
                    console.log(res);
                    if(res.success) {
                        refresh();
                    }
                });

        }

        function createScope() {
            const newScopes = scopes.concat([scope]);
            setScopes(newScopes);
        }
    
        return <GridToolbarContainer>
            {/* <Button disabled>
                View options
            </Button> */}
            <Button color="primary" onClick={()=>{refresh();}}>
                Refresh
            </Button>
            <Button color="primary" onClick={()=>{setAddingUser(true);}}>
                Add user
            </Button>
            
            <Button color="primary" onClick={() => {setDeletingUsers(true);}} disabled={rowSelectionModel.length == 0}>
                Delete {rowSelectionModel.length} {(rowSelectionModel.length == 1) ? "user" : "users"}
            </Button>

            <Button color="primary" onClick={() => {setCreatingScope(true);}}>
                Create scope
            </Button>
    
            <Dialog open={addingUser} onClose={()=>{setAddingUser(false);}}>
                <DialogTitle>Add a user</DialogTitle>
                <DialogContent>
                    <TextField error={!validateName(name)} value={name} onChange={(e) => {setName(e.target.value);}} autoFocus margin="dense" id="name" label="Name" type="text" fullWidth variant="standard"/>    
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={()=>{setAddingUser(false);}}>Cancel</Button>
                    <Button onClick={()=>{setAddingUser(false);addUser();}}>Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deletingUsers} onClose={()=>setDeletingUsers(false)}>
                <DialogTitle>Confirm delete users</DialogTitle>
                <DialogContent>
                    <DialogContentText>This action is irreversible.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{setDeletingUsers(false);}}>Cancel</Button>
                    <Button onClick={()=>{setDeletingUsers(false);deleteUsers();}}>Confirm Delete</Button>
                </DialogActions>
            </Dialog>

            
            <Dialog open={creatingScope} onClose={()=>setCreatingScope(false)}>
                <DialogTitle>Create scope</DialogTitle>
                <DialogContent>
                    <TextField error={!validateScope(scope)} value={scope} onChange={(e) => {setScope(e.target.value);}} autoFocus margin="dense" id="scope name" label="Scope Name" type="text" fullWidth variant="standard"/>    
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{setCreatingScope(false);}}>Cancel</Button>
                    <Button onClick={()=>{setCreatingScope(false);createScope();}}>Add</Button>
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
    

    
    function addScope() {
        // console.log("add scope");
        fetch(`/api/add-scope?id=${cellBeingEdited.id}&scope=${cellBeingEdited.scope}&expires_at=${selectedDate.getTime()}`)
            .then(res => res.json())
            .then((res : AddScopeResponseType) => {
                console.log(res);
                if(res.success) {
                    refresh();
                }
            });
    }

    const cols: GridColDef[] = useMemo(() => {
        const cols : GridColDef[] = [{ 
            field: "name", 
            width: 250,
            renderHeader() {
                return <strong>Name</strong>
            }
        },
        // { 
        //     field: "id", 
        //     width: 550,
        //     hideable: true,
        //     renderHeader() {
        //         return <strong>Id</strong>
        //     }
        // }
    ];

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
                    if(props.value == null) {
                        return <>--</>
                    }
                    const expirationDate = props.value as Date;
                    const never = new Date(8640000000000000);
                    if(never <= expirationDate) {
                        return <>
                            Never
                        </>
                        }
                    return <>
                        {expirationDate.toLocaleDateString()}
                    </>
                },
                renderEditCell: (props) => {
                    
                    // const gridApiRef = useGridApiContext();

                    function removeScope() {
                        console.log(`/api/remove-scope?id=${props.id}&scope=${scope}`);
                        fetch(`/api/remove-scope?id=${props.id}&scope=${scope}`, { method: "POST" })
                            .then(res => res.json())
                            .then((res : RemoveScopeResponseType) => {
                                console.log(res);
                                setRowModesModel({ ...rowModesModel, [props.id]: { mode: GridRowModes.View } })
                                // gridApiRef.current.stopCellEditMode({id: props.id, field: scope, ignoreModifications: false});
                                if(res.success) {
                                    refresh();
                                }
                            });
                    }

                    if(props.value != null) {
                        const expirationDate = props.value as Date;
                        return <Box margin="auto">
                            <ButtonGroup>
                                <Button color="error" variant="outlined" onClick={() => {removeScope();}}><Delete></Delete></Button>
                                <Button onClick={() => {setSelectingDate(true);setCellBeingEdited({ id: props.id as string, scope: scope})}}><Edit></Edit></Button> 
                            </ButtonGroup>
                        </Box>
                    }else {
                        return <Box margin="auto">
                                <Button onClick={() => {setSelectingDate(true);setCellBeingEdited({ id: props.id as string, scope: scope})}}><Edit></Edit></Button> 
                        </Box>
                    }
                },
                editable: true
            });
        });

        return cols;
    }, [scopes, rowModesModel]);

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
              onRowModesModelChange={setRowModesModel}
              onRowSelectionModelChange={(newRowSelectionModel) => {
                setRowSelectionModel(newRowSelectionModel);
              }}
              rowSelectionModel={rowSelectionModel}
              checkboxSelection rows={rows} columns={cols}/>
        <Dialog open={selectingDate} onClose={() => {setSelectingDate(false);}}>
                                    <DialogTitle>Add a scope:</DialogTitle>
                                    <DialogContent>
                                        <Input title="Expiration Date" type="date" onChange={(e) => {setSelectedDate(new Date((e.target as HTMLInputElement).valueAsNumber));}}/>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => {setSelectingDate(false);}}>Cancel</Button>
                                        <Button onClick={() => {setSelectingDate(false);addScope()}}>Add scope</Button>
                                    </DialogActions>
                                </Dialog>
        </Box>
}
  
  
  