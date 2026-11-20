import { AppError } from '@/lib/errors/base';

export enum DocumentErrorCode {
    CreateFailed = 'DOCUMENT_CREATE_FAILED',
    ConfirmFailed = 'DOCUMENT_CONFIRM_FAILED',
    UploadNotPending = 'DOCUMENT_UPLOAD_NOT_PENDING',
    AssignAreaFailed = 'DOCUMENT_ASSIGN_AREA_FAILED',
}

export class DocumentError extends AppError {
    constructor(code: DocumentErrorCode, detail: string, genericMessage: string, statusCode: number) {
        super(code, detail, genericMessage, statusCode);
    }
}
