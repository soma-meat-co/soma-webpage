import { AppError } from "./base";

export enum UserErrorCode {
    UserData = 'USER_DATA_ERROR'
}

export class UserError extends AppError {
    constructor(code: UserErrorCode, detail: string, genericMessage: string, statusCode: number){
        super(code, detail, genericMessage, statusCode);
    }
}