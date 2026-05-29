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

const Hero = dynamic(
  () => import("@/components/sections/hero").then((mod) => mod.Hero),
  { ssr: false }
);

export const HomePage: FC = () => (
  <div className="container mx-auto max-w-7xl">
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
);
