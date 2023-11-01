


export interface UserSession {
    accessToken: string,
    expiresAt: Date,
};

export class UserSession {
    constructor() { 
        console.warn("\"UserSession\" has not been implemented!!! No authentication is currently being performed.");
        this.accessToken = "";
        this.expiresAt = new Date(0);
    }

    authenticate() {
        console.warn("\"UserSession.authenticate()\" has not been implemented!!! No authentication is currently being performed.");
        this.accessToken = "";
        this.expiresAt = new Date(8640000000000000);
    }

    refresh() {
        console.warn("\"UserSession.refresh()\" has not been implemented!!! No authentication is currently being performed.");
        this.accessToken = "";
        this.expiresAt = new Date(8640000000000000);
    }

    end() {
        console.warn("\"UserSession.end()\" has not been implemented!!! No authentication is currently being performed.");
        this.accessToken = "";
        this.expiresAt = new Date(0);
    }

    isValid() {
        console.warn("\"UserSession.isValid()\" has not been implemented!!! All operations will be permitted");

        const now = new Date();
        return now < this.expiresAt;
    }
}