
import { handleDatabaseError } from '../../app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserCollection, UserWithDateObject } from '../../app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'
import { DATABASE_URL } from '../../app/common/server-env';



export type ResponseType = SuccessfulResponse | FailedResponse;
 
interface SuccessfulResponse {
  success: true,
  users: User[],
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

  const usersCollection = client.db("rfid").collection("users") as UserCollection

  
  const result = (await usersCollection
    .find()
    .toArray()
    .catch((error) => handleDatabaseError(error, res)));
  
  if(result == null) {
    handleDatabaseError("What happened to the \"users\" collection?", res);
    return;
  }



  const users = result.map((user) => {
    return {
      _id: user._id,
      name: user.name,
      scopes: user.scopes.map((scope) => {
        return {
          scope: scope.scope,
          expires_at: scope.expires_at.toISOString()
        };
      })
    }
  });
  
  
  res.status(200).json({
    success: true,
    users: users
  });
}