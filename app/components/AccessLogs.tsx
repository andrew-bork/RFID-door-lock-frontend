"use client"
import { Box } from "@mui/material"
import { DataGrid, GridColDef, GridRowModes, GridRowModesModel, GridRowSelectionModel, GridRowsProp, GridToolbarContainer, useGridApiContext } from "@mui/x-data-grid"
import { useEffect, useMemo, useState } from "react"
import styles from './UserList.module.css'

import type { ResponseType as GetLogsResponseType  } from '@/pages/api/get-logs';
import { LogEntry } from "../common/types";

export function AccessLogs() {

    const [ logs, setLogs ] = useState<LogEntry[]>([]);

    const refresh = () => {
        fetch("/api/get-logs")
            .then((res) => res.json())
            .then((res : GetLogsResponseType) => {
                console.log(res);
                if(res.success) {
                    setLogs(res.logs);
                }else {
                    console.error(res.message);
                }
            });
    }

    useEffect(() => {
        refresh();
    });

    const rows: GridRowsProp = useMemo(() => {
        return logs.map((entry) => {
            const row : {[x: string]: string|number|Date|null|boolean}= {
                id: entry._id,
                user_name: entry.user_name,
                log_type: entry.log_type,
                success: entry.success,
                requested_scope: entry.requested_scope,
                reason: (entry.reason ?? ""),
                time: new Date(entry.time)
            };
            return row;
        });
    }, [logs]);

    
    const cols: GridColDef[] = useMemo(() => {
        const cols : GridColDef[] = [
            {
                field: "time",
                width: 180,
                headerName: "Time",
                renderCell(props) {
                    return <>
                        {(props.value as Date).toLocaleString()}
                    </>
                }
            },
            { 
                field: "log_type", 
                width: 100,
                renderHeader() {
                    return <>Log Type</>
                }
            },
            {
                field: "success",
                headerName: "Result",
                width: 75,
                cellClassName(props) {
                    if(props.value) {
                        return styles["cell-valid"];
                    }else {
                        return styles["cell-expired"];
                    }
                },
                renderCell(props) {
                    return <>{(props.value ? "success" : "fail")}</>
                }
            },
            {
                field: "user_name",
                headerName: "User",
                width: 250,
            },
            {
                field: "requested_scope",
                headerName: "Req. Scope",
                width: 150,
            },
            {
                field: "reason",
                headerName: "Reason",
                width: 400,
            },

        ];
        return cols;
    }, []);



    return <Box>
        <DataGrid 
            initialState={{
                sorting: {
                    sortModel: [{ field: "time", sort: "desc" }]
                }
            }}
            columns={cols} rows={rows}/>
    </Box>

}