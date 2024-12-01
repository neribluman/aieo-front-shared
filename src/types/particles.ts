export interface ParticlesOptions {
  background: {
    opacity: number;
  };
  particles: {
    color: {
      value: string;
    };
    links: {
      color: string;
      distance: number;
      enable: boolean;
      opacity: number;
      width: number;
    };
    move: {
      enable: boolean;
      speed: number;
    };
    number: {
      value: number;
    };
    opacity: {
      value: number;
    };
    size: {
      value: {
        min: number;
        max: number;
      };
    };
  };
} 