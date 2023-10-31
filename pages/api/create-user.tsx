import { BYTES_PER_ID } from '../../app/common/env';
import { handleDatabaseError, handleInvalidRequest } from '../../app/common/error-handling';
import { Collection, MongoClient } from 'mongodb'

import type { User, UserWithDateObject } from '../../app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'

import crypto from "crypto";
import { validateName } from '../../app/common/validate';
import { DATABASE_URL } from '../../app/common/server-env';

/**
 * Create and return a base64url encoded id with BYTES_PER_ID bytes
 * @returns 
 */
function generateID() {
    const id = crypto.randomBytes(BYTES_PER_ID); 
    return id.toString("base64url");
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
    
    const users = client.db("rfid").collection("users") as Collection<User>; 

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

    console.log(`Creating user "${name}" with id="${id}"`);
    await (users.insertOne({ 
        _id: id,
        name: name as string,
        scopes: []
    }).catch((error) => handleDatabaseError(error, res)));


    res.status(200).json({success: true});
}