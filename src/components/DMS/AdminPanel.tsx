"use client";

import { useCallback, useEffect, useState } from "react";
import { Tags, Users } from "lucide-react";

import { ComingSoonButton } from "@/components/DMS/ComingSoonButton";
import { DmsSection } from "@/components/DMS/DmsSection";
import { LinkButton } from "@/components/DMS/LinkButton";
import { AreaListComponent } from "@/app/DMS/areas/areaListComponent";
import { CreateAreaComponent } from "@/app/DMS/areas/createAreaComponent";
import { fetchAllAreas } from "@/app/DMS/areas/areas.actions";
import { UploadDocumentsComponent } from "@/app/DMS/documents/uploadDocumentsComponent";
import type { Area } from "@/lib/core/areas/provider/areas.provider";

const CARD = "space-y-4 rounded-lg border border-soma-gray-lt bg-white p-4 shadow-soma md:p-6";

/**
 * Acciones de administración: accesos a usuarios y tags, subida de documentos
 * (2/3 del ancho) y gestión de áreas (1/3). Carga las áreas una vez y las
 * vuelve a pedir cuando se crea, edita o borra una, así la lista y el dropdown
 * de la subida se mantienen al día. Quien lo usa decide si mostrarlo según el rol.
 *
 * @returns la sección de administración
 * @example
 * {isAdminRole(user.role) && <AdminPanel />}
 */
export function AdminPanel() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [areasError, setAreasError] = useState("");

    const loadAreas = useCallback(async () => {
        try {
            const result = await fetchAllAreas();
            if (result.ok === false) {
                setAreasError(result.message);
                return;
            }
            setAreasError("");
            setAreas(result.areas);
        } catch (err) {
            console.error("[AdminPanel] error inesperado al cargar áreas:", err);
            setAreasError("No se pudieron cargar las áreas. Revisa tu conexión.");
        }
    }, []);

    useEffect(() => {
        loadAreas();
    }, [loadAreas]);

    return (
        <DmsSection title="Administración">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <LinkButton href="/DMS/admin/user-management" label="Usuarios" icon={Users} />
                <ComingSoonButton label="Tags" icon={Tags} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className={`${CARD} md:col-span-2`}>
                    <h3 className="text-sm font-bold text-soma-brown">Subir documento</h3>
                    <UploadDocumentsComponent areas={areas} />
                </div>

                <div className={CARD}>
                    <h3 className="text-sm font-bold text-soma-brown">Áreas</h3>
                    {areasError && (
                        <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{areasError}</p>
                    )}
                    <CreateAreaComponent onCreated={loadAreas} />
                    <AreaListComponent areas={areas} onChanged={loadAreas} />
                </div>
            </div>
        </DmsSection>
    );
}
