import { AppError } from '@/lib/errors/base';

export enum StorageErrorCode {
    UploadUrlFailed = 'STORAGE_UPLOAD_URL_FAILED',
    DownloadUrlFailed = 'STORAGE_DOWNLOAD_URL_FAILED',
}

export class StorageError extends AppError {
    constructor(code: StorageErrorCode, detail: string, genericMessage: string, statusCode: number) {
        super(code, detail, genericMessage, statusCode);
    }
}
