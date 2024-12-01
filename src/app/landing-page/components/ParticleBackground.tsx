'use client';
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import type { ParticlesOptions } from "@/types/particles";

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options: ParticlesOptions = {
    background: {
      opacity: 0
    },
    particles: {
      color: {
        value: "#6366f1"
      },
      links: {
        color: "#6366f1",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 1
      },
      number: {
        value: 50
      },
      opacity: {
        value: 0.3
      },
      size: {
        value: { min: 1, max: 3 }
      }
    }
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
    />
  );
};

export default ParticleBackground; 