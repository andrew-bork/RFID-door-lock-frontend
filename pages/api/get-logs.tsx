
import { handleDatabaseError } from '../../app/common/error-handling';
import { Collection, MongoClient } from 'mongodb'

import type { DatabaseLogEntry, LogEntry, UserCollection, UserWithDateObject } from '../../app/common/types';
import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'
import { DATABASE_URL } from '../../app/common/server-env';



export type ResponseType = SuccessfulResponse | FailedResponse;
 
interface SuccessfulResponse {
  success: true,
  logs: LogEntry[],
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

  const logsCollection = client.db("rfid").collection("logs") as Collection<DatabaseLogEntry>

  
  const result = (await logsCollection
    .find()
    .limit(50)
    .sort({ time: -1 })
    .toArray()
    .catch((error) => handleDatabaseError(error, res)));
  
  if(result == null) {
    handleDatabaseError("What happened to the \"logs\" collection?", res);
    return;
  }

  const usersIds : Set<string>  = new Set();
  result.forEach((entry) => {
    usersIds.add(entry.user_id);
  });

  const users = ( await (client.db("rfid").collection("users") as UserCollection)
    .find({ _id: { $in: Array.from(usersIds) } })
    .toArray()
    .catch((error) => handleDatabaseError(error, res)));

  const logs = result.map((entry) => {
    // entry.time = (new Date(entry.time)).getTime();
    let name = null;
    if(users) {
      const user = users.find((user) => user._id === entry.user_id);
      if(user != null) {
        name = user.name;
      }
    }

    return {
      ...entry,
      user_name: name,
      time: (new Date(entry.time)).getTime()
    };
  });

  
  res.status(200).json({
    success: true,
    logs: logs,
  });
}