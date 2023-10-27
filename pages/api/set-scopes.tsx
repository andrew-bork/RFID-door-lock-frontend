import { DATABASE_URL } from '@/app/common/env';
import { handleDatabaseError, handleInvalidRequest } from '@/app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserWithDateObject } from '@/app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'



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

    const userId = req.query.id;
    if(userId == null) {
        handleInvalidRequest(`Missing "id" parameter.`, res);
        return;
    }

    const scope = req.query.scope;
    const user = await users.findOne({ _id: userId });

    if(user == null) {
        handleInvalidRequest(`User with id="${userId}" does not exist.`, res);
        return;
    }

    await client.withSession(async (session) => {
        await users.updateOne(
                { _id: userId }, 
                { $pull: { 
                    scopes: {
                        scope: { 
                            $in: scope
                        } 
                    } 
                } }, 
                { session });
        
        await users.updateOne(
                { _id: userId }, 
                { $push: { 
                    scopes: {
                        $each: scope,
                    } 
                } }, 
                { session });
    }).catch((error) => handleDatabaseError(error, res));

    res.status(200).json({success: true});
    // TODO make this idempotent
  
  
  
}