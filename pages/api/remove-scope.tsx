import { handleDatabaseError, handleInvalidRequest } from '@/app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserCollection, UserWithDateObject } from '@/app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'
import { DATABASE_URL } from '@/app/common/server-env';
import { validateScope } from '@/app/common/validate';

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

    const id = req.query.id as string;
    if(id == null) {
        handleInvalidRequest(`Missing "id" parameter.`, res);
        return;
    }

    const scope = req.query.scope as string;
    if(scope == null) {
        handleInvalidRequest(`Missing "scope" parameter.`, res);
        return;
    }
    if(!validateScope(scope)) {
        handleInvalidRequest(`scope="${scope}" is not a valid scope`, res);
        return;
    }



    console.log(`Deleting scope="${scope}" from user with id="${id}"`);
    await (users.updateOne({ _id: id }, { $pull: { scopes: {scope: scope } } }).catch((error) => handleDatabaseError(error, res)));

    res.status(200).json({success: true});
}