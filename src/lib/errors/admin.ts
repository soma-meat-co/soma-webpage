import { AppError } from '@/lib/errors/base';

export enum AdminErrorCode {
    InvalidInput = 'ADMIN_INVALID_INPUT',
    EmailNotInstitutional = 'ADMIN_EMAIL_NOT_INSTITUTIONAL',
    EmailExists = 'ADMIN_EMAIL_EXISTS',
    InviteFailed = 'ADMIN_INVITE_FAILED',
    ListUsersFailed = 'ADMIN_LIST_USERS_FAILED',
    UpdateUserFailed = 'ADMIN_UPDATE_USER_FAILED',
    RemoveUserFailed = 'ADMIN_REMOVE_USER_FAILED',
}

export class AdminError extends AppError {
    constructor(code: AdminErrorCode, detail: string, genericMessage: string, statusCode: number) {
        super(code, detail, genericMessage, statusCode);
    }
}
