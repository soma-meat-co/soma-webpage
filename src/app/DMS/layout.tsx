import { UserProvider } from "@/lib/core/context/userContext";
import { DmsShell } from "./DmsShell";

export default function DMSLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <DmsShell>{children}</DmsShell>
        </UserProvider>
    );
}
