import { AppError } from '@/lib/errors/base';

export enum AreaErrorCode {
    CreateFailed = 'AREA_CREATE_FAILED',
    UpdateFailed = 'AREA_UPDATE_FAILED',
    DeleteFailed = 'AREA_DELETE_FAILED',
    FetchFailed = 'AREA_FETCH_FAILED',
    AssignUserFailed = 'AREA_ASSIGN_USER_FAILED',
}

export class AreaError extends AppError {
    constructor(code: AreaErrorCode, detail: string, genericMessage: string, statusCode: number) {
        super(code, detail, genericMessage, statusCode);
    }
}
