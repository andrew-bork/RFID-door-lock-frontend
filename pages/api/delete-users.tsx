import { handleDatabaseError, handleInvalidRequest } from '../../app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserCollection, UserWithDateObject } from '../../app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'
import { DATABASE_URL } from '../../app/common/server-env';

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

    const idsString = req.query.ids as string;
    if(idsString == null) {
        handleInvalidRequest(`Missing "ids" parameter.`, res);
        return;
    }

    const ids = idsString.split(" ");

    console.log(`Deleting user with ids="${idsString}"`);
    await (users.deleteMany({ _id: { $in: ids} }).catch((error) => handleDatabaseError(error, res)));

    res.status(200).json({success: true});
}