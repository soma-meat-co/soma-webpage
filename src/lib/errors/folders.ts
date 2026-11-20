import { AppError } from '@/lib/errors/base';

export enum FolderErrorCode {
    CreateFailed = 'FOLDER_CREATE_FAILED',
    RenameFailed = 'FOLDER_RENAME_FAILED',
    MoveFailed = 'FOLDER_MOVE_FAILED',
    DeleteFailed = 'FOLDER_DELETE_FAILED',
    FetchFailed = 'FOLDER_FETCH_FAILED',
    AssignAreaFailed = 'FOLDER_ASSIGN_AREA_FAILED',
    RemoveAreaFailed = 'FOLDER_REMOVE_AREA_FAILED',
}

export class FolderError extends AppError {
    constructor(code: FolderErrorCode, detail: string, genericMessage: string, statusCode: number) {
        super(code, detail, genericMessage, statusCode);
    }
}
