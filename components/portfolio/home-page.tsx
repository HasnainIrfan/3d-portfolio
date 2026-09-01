"use client";

import dynamic from "next/dynamic";
import { type FC } from "react";
import { Navbar } from "@/components/sections/navbar";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Projects } from "@/components/sections/projects";
import { Experiences } from "@/components/sections/experiences";
import { Testimonial } from "@/components/sections/testimonial";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { PageLoader } from "@/components/portfolio/page-loader";

const Hero = dynamic(
  () => import("@/components/sections/hero").then((mod) => mod.Hero),
  { ssr: false }
);

const ThemedGlobe = dynamic(
  () =>
    import("@/components/globe/themed-globe").then((mod) => mod.ThemedGlobe),
  { ssr: false }
);

export const HomePage: FC = () => (
  <>
    <PageLoader />
    <ThemedGlobe />
    <div className="relative z-10 w-full">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Projects />
      <Experiences />
      <Testimonial />
      <Contact />
      <Footer />
    </div>
  </>
);
