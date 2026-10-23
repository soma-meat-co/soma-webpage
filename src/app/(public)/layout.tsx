import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PublicLayout({ children }: {children: React.ReactNode}) {
    return (
        <div>
            <Navbar isDms={false} />
                {children}
            <Footer/>
        </div>
    );
}