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