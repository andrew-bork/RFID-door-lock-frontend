import { Collection } from "mongodb"

export interface Scope {
    scope: string,
    expires_at: string, // ISO Date string.
}

export interface UserWithDateObject {
    _id: string,
    name: string,
    scopes: {scope: string, expires_at: Date}[]
}


export interface User {
    _id: string,
    name: string,
    scopes: Scope[]
}


export interface Selectable<T> {
    selected: boolean,
    item: T
};

export type UserCollection = Collection<UserWithDateObject>

export type DatabaseLogEntry = DatabaseAuthLogEntry;

export type DatabaseAuthLogEntry = {
    _id: string,
    log_type: "auth-log",
    user_id: string,
    requested_scope: string,
    time: Date,
    success: boolean,
    reason?: string
};



export type LogEntry = AuthLogEntry;

export type AuthLogEntry = {
    _id: string,
    log_type: "auth-log",
    user_id: string,
    user_name: string|null,
    requested_scope: string,
    time: number,
    success: boolean,
    reason?: string
};
