import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'

export function handleDatabaseError(error:string, res:Response<any>) {
    console.error(`Something went wrong with the database.`);
    console.error(error);

    res.status(500).json({
        success: false,
        message: `Something went wrong with the database.`
    });
}