import { AppError } from '@/lib/errors/base';

export enum AuthErrorCode{
    AuthenticationFailure = 'AUTH_AUTHENTICATION_FAILURE',
    EmailNotConfirmed = 'AUTH_EMAIL_NOT_CONFIRMED',
    UserNotFound = 'AUTH_USER_NOT_FOUND',
    RoleNotFound = 'AUTH_ROLE_NOT_FOUND',
}

export class AuthError extends AppError {
    constructor(code: AuthErrorCode, detail: string, genericMessage: string, statusCode: number){
            super(code, detail, genericMessage, statusCode);
    } 
}