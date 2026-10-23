"use client";

import { useUser } from "@/lib/core/context/userContext";
import Navbar from "@/components/Navbar";

export function DmsShell({ children }: { children: React.ReactNode }) {
    const { session, role } = useUser();

    return (
        <>
            <Navbar isDms={true} role={role ?? undefined} name={session?.name} />
            {children}
        </>
    );
}
