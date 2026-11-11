import { ListFilter, Search } from "lucide-react";

import { ComingSoonButton } from "@/components/DMS/ComingSoonButton";
import { Input } from "@/components/ui/input";

/**
 * Buscador de usuarios por nombre y filtro por área. Aún no tiene funcionalidad.
 *
 * @returns el buscador
 * @example
 * <UserSearch />
 */
export function UserSearch() {
    return (
        <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1">
                <Search
                    size={16}
                    aria-hidden
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-soma-brown/70"
                />
                <Input
                    disabled
                    type="search"
                    aria-label="Buscar usuarios por nombre"
                    placeholder="Buscar por nombre..."
                    className="h-11 border-soma-gray pl-9 shadow-soma placeholder:text-soma-brown/70 disabled:bg-white disabled:opacity-100 md:h-9"
                />
            </div>
            <ComingSoonButton label="Filtrar por área" icon={ListFilter} />
        </div>
    );
}
