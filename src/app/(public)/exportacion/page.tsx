import type { Metadata } from "next";
import { StatBand } from "@/components/ui/StatBand";
import { ExportHero } from "./_components/ExportHero";
import { ExportCertifications } from "./_components/ExportCertifications";
import { ExportCutsSection } from "./_components/ExportCutsSection";
import { ExportContact } from "./_components/ExportContact";
import { exportStats } from "./_data";

export const metadata: Metadata = {
  title: "Export Division — SOMA MEAT CO | TIF 422 Certified Premium Lamb | Mexico",
  description: "SOMA MEAT CO — Mexico's TIF 422 certified meat processing plant. Premium lamb cuts for international markets. HACCP certified, Kosher & Halal available.",
};

export default function ExportacionPage() {
  return (
    <main className="bg-soma-black text-soma-off-wh">
      <ExportHero />
      <StatBand stats={exportStats} />
      <ExportCertifications />
      <ExportCutsSection />
      <ExportContact />
    </main>
  );
}
