import { UploadDocumentsComponent } from "@/app/DMS/documents/uploadDocumentsComponent";

/**
 * Dashboard de administración. Por ahora solo contiene la subida de documentos.
 *
 * @returns el dashboard con el componente de subida
 */
export default function AdminDashboardPage() {
  return (
    <div
      className="mx-auto w-full max-w-md px-6 py-10"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <UploadDocumentsComponent />
    </div>
  );
}
