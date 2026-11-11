import { AppError } from '@/lib/errors/base';

export enum AccessErrorCode{
    AuthorizationFailure = 'ACCESS_AUTHORIZATION_FAILURE',
    RoleCheckFailed = 'ACCESS_ROLE_CHECK_FAILED',
}

export class AccessError extends AppError {
    constructor(code: AccessErrorCode, detail: string, genericMessage: string, statusCode: number){
            super(code, detail, genericMessage, statusCode);
    } 
}