'use server'

import type { PendingDocumentInput } from "@/lib/core/documents/provider/documents.provider";
import { documentsProvider } from "@/lib/core/documents/service/documents.service";
import { storageProvider} from "@/lib/core/storage/service/storage.service";
import type { SignedUrl } from "@/lib/core/storage/provider/storage.provider";
import { AppError } from "@/lib/errors/base";


export type UploadDocumentResult = 
    | {ok: true; uuid: string; signedUrl: SignedUrl}
    | {ok: false; code: string; message: string};

export type ConfirmedUploadResult = 
    | {ok: true}
    | {ok: false; code: string; message: string}; 

export async function uploadDocument(input: PendingDocumentInput): Promise<UploadDocumentResult> {
    try {
        const {id, key }= await documentsProvider.createPendingDocument(input); 
        const url: SignedUrl = await storageProvider.createUploadUrl({
            key,
            contentType: input.fileType,
            size: input.fileSize,
        });
        return {ok: true, uuid: id, signedUrl: url};
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`[uploadDocument] ${err.code} (${err.statusCode}): ${err.detail}`);
            return {ok: false, code: err.code, message: err.genericMessage};
        }
        console.error(`[uploadDocument] error inesperado: `, err);
        return { ok: false, code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado. Intetna mas tarde'}
    }
}

export async function confirmUploadedDocument(documentId: string): Promise<ConfirmedUploadResult> {
    try {
        await documentsProvider.confirmUpload(documentId);
        return {ok: true};
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`[confirmUploadedDocument] ${err.code} (${err.statusCode}): ${err.detail}`);
            return {ok: false, code: err.code, message: err.genericMessage};
        }
        console.error(`[confirmUploadedDocument] error inesperado: `, err);
        return { ok: false, code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado. Intetna mas tarde'}
    }
}