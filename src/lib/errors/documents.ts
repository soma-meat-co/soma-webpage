import { AppError } from '@/lib/errors/base';

export enum DocumentErrorCode {
    CreateFailed = 'DOCUMENT_CREATE_FAILED',
    ConfirmFailed = 'DOCUMENT_CONFIRM_FAILED',
    UploadNotPending = 'DOCUMENT_UPLOAD_NOT_PENDING',
    AssignAreaFailed = 'DOCUMENT_ASSIGN_AREA_FAILED',
    MoveToFolderFailed = 'DOCUMENT_MOVE_TO_FOLDER_FAILED',
    FetchFailed = 'DOCUMENT_FETCH_FAILED',
    NotFound = 'DOCUMENT_NOT_FOUND',
    UpdateFailed = 'DOCUMENT_UPDATE_FAILED',
}

export class DocumentError extends AppError {
    constructor(code: DocumentErrorCode, detail: string, genericMessage: string, statusCode: number) {
        super(code, detail, genericMessage, statusCode);
    }
}
