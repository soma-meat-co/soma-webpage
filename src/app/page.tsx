import { HeroSection } from "./_home/HeroSection";
import { StatsBand } from "./_home/StatsBand";
import { AboutSection } from "./_home/AboutSection";
import { ServicesSection } from "./_home/ServicesSection";
import { CertificationsSection } from "./_home/CertificationsSection";
import { MarketsSection } from "./_home/MarketsSection";
import { SpeciesSection } from "./_home/SpeciesSection";
import { CTASection } from "./_home/CTASection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsBand />
      <AboutSection />
      <ServicesSection />
      <CertificationsSection />
      {/* <MarketsSection /> */}
      <SpeciesSection />
      <CTASection />
    </main>
  );
}
