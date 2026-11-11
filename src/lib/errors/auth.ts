import { AppError } from '@/lib/errors/base';

export enum AuthErrorCode{
    AuthenticationFailure = 'AUTH_AUTHENTICATION_FAILURE',
    EmailNotConfirmed = 'AUTH_EMAIL_NOT_CONFIRMED',
    UserNotFound = 'AUTH_USER_NOT_FOUND',
    RoleNotFound = 'AUTH_ROLE_NOT_FOUND',
    LinkInvalid = 'AUTH_LINK_INVALID',
    WeakPassword = 'AUTH_WEAK_PASSWORD',
    NewPasswordError = 'AUTH_NEW_PASSWORD_ERROR',
    OtpVerificationError = 'AUTH_OTP_VERIFICATION_ERROR',
    PasswordResetRequestError = 'AUTH_PASSWORD_RESET_REQUEST_ERROR',
}

export class AuthError extends AppError {
    constructor(code: AuthErrorCode, detail: string, genericMessage: string, statusCode: number){
            super(code, detail, genericMessage, statusCode);
    } 
}