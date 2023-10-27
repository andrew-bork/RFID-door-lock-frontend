import { DATABASE_URL, BYTES_PER_ID, MAX_NAME_LENGTH } from '@/app/common/env';
import { handleDatabaseError, handleInvalidRequest } from '@/app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserWithDateObject } from '@/app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'

import crypto from "crypto";

/**
 * Create and return a base64url encoded id with BYTES_PER_ID bytes
 * @returns 
 */
function generateID() {
    const id = crypto.randomBytes(BYTES_PER_ID); 
    return id.toString("base64url");
}


/**
 * Returns true if the string is a valid name. False otherwise
 * @param {string} name 
 */
function validateName(name:any) {
    if(typeof(name) !== "string") return false;
    return name.length < MAX_NAME_LENGTH && /^[\w ]+$/g.test(name);
}


export type ResponseType = SuccessfulResponse | FailedResponse;
 
interface SuccessfulResponse {
    success: true,
};
interface FailedResponse {
    success: false,
    message: string,
}

export default async function handler(
  req: Request,
  res: Response<ResponseType>
) {
    const client = new MongoClient(DATABASE_URL);
    await (client.connect().catch((error) => handleDatabaseError(error, res)));
    
    const users = client.db("rfid").collection("users");

    const name = req.query.name;
    if(name == null) {
        handleInvalidRequest(`Missing "name" parameter.`, res);
        return;
    }
    if(!validateName(name)) {
        handleInvalidRequest(`name="${name}" is not a valid name.`, res);
        return;
    }

    
    async function exists(id:string) {
        const result = await (users.findOne({_id: id}).catch((error) => handleDatabaseError(error, res)));
        return result != null;
    }
    
    let id = generateID();
    while(await exists(id)) {
        id = generateID();
    }


    await (users.insertOne({ 
        _id: id,
        name: name,
        scopes: []
    }).catch((error) => handleDatabaseError(error, res)));


    res.status(200).json({success: true});
}