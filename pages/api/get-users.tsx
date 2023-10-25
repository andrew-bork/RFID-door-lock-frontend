import { DATABASE_URL } from '@/app/common/env';
import { handleDatabaseError } from '@/app/common/error-handling';
import { MongoClient } from 'mongodb'

import type { User, UserWithDateObject } from '@/app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'



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

  // Should be User[]. We should kernel panic if it isn't
  const users : User[] = ((await client
    .db("rfid")
    .collection("users")
    .find()
    .toArray()
    .catch((error) => handleDatabaseError(error, res)) as unknown) as UserWithDateObject[]) // Typecasting to make typescript happy. Fundamentally does nothing. If users isn't isnt a User[], we should probably halt and catch fire.
    .map((user) => {
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