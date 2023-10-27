import type { NextApiRequest as Request, NextApiResponse as Response} from 'next'


interface FailedResponse {
    success: false,
    message: string,
}

export function handleDatabaseError(error:string, res:Response<FailedResponse>) {
    console.error(`Something went wrong with the database.`);
    console.error(error);

    res.status(500).json({
        success: false,
        message: `Something went wrong with the database.`
    });
}

export function handleInvalidRequest(error:string, res:Response<FailedResponse>) {
    res.status(400).json({
        success: false,
        message: error
    });
}