import { handleDatabaseError, handleInvalidRequest } from '../../app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserCollection, UserWithDateObject } from '../../app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'
import { DATABASE_URL } from '../../app/common/server-env';
import { validateScope } from '../../app/common/validate';

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
    
    const users = client.db("rfid").collection("users") as UserCollection; 

    const id = req.query.id as string|undefined;
    if(id == null) {
        handleInvalidRequest(`Missing "id" parameter.`, res);
        return;
    }

    const scope = req.query.scope as string|undefined;
    if(scope == null) {
        handleInvalidRequest(`Missing "scope" parameter.`, res);
        return;
    }
    if(!validateScope(scope)) {
        handleInvalidRequest(`scope="${scope}" is not a valid scope`, res);
        return;
    }

    const expiresAtString = req.query.expires_at as string|undefined;
    if(expiresAtString == null) {
        handleInvalidRequest(`Missing "expires_at" parameter.`, res);
        return;
    }
    const expiresAtMS = parseInt(expiresAtString);
    if(isNaN(expiresAtMS)) {
        handleInvalidRequest(`"expires_at" is not a number.`, res);
        return;
    }
    const expiresAt = new Date(expiresAtMS);
    const now = new Date();
    if(expiresAt < now) {
        handleInvalidRequest(`"expires_at" expiration date has already passed.`, res);
        return;
    }



    console.log(`Adding scope="${scope}" from user with id="${id}, expiring at "${expiresAt.toISOString()}"`);
   
    const pullResult = await users.updateOne({ _id: id }, { $pull: { scopes: {scope: scope } } });
    const pushResult = await users.updateOne({ _id: id }, { $push: { scopes: { scope: scope, expires_at: expiresAt } } });
        
    // MAKE THIS IDEMPOTENT!!!!!!!

    res.status(200).json({success: true});
}