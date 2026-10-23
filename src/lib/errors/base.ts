/**
 * Error base de la aplicación. No se instancia directamente;
 * las capas de servicio lanzan sus subclases (AuthError, StorageError).
 *
 * @param code - identificador estable del error, definido en el enum de cada capa
 * @param message - mensaje legible para logs o respuesta al cliente
 * @param statusCode - código HTTP a devolver en la respuesta
 */
export abstract class AppError extends Error {
    public readonly detail: string;
    constructor(    
        public readonly code: string,
        detail: string,
        genericMessage: string,
        public readonly statusCode: number,
    ) {
        const isDev = process.env.NODE_ENV === "development";
        super(isDev ? `${new.target.name}: ${detail}` : `${new.target.name}: ${genericMessage}`);
        this.name = new.target.name;
        this.detail = detail;
        Object.setPrototypeOf(this, new.target.prototype);
    }

}