import { Navbar } from "./components/Navbar";
import { Hero } from "./sections/Hero";
import { EventoraModules } from "./sections/EventoraModules";
import { ExperienceShowcase } from "./sections/ExperienceShowcase";
import { Testimonials } from "./sections/Testimonials";
import { Pricing } from "./sections/Pricing";
import { FAQ } from "./sections/FAQ";
import { FinalCTA } from "./sections/FinalCTA";
import { Footer } from "./components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ExperienceShowcase />
        <EventoraModules />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
