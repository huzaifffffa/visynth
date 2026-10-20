export type PortfolioCategory =
  | "All Work"
  | "Character Design"
  | "3D Models"
  | "Video Editing"
  | "Website Development"
  | "Graphic Design"
  | "Branding"
  | "3D Animation"
  | "UI/UX Design";

export interface PortfolioItem {
  id: string;
  title: string;
  category: Exclude<PortfolioCategory, "All Work">;
  description: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
}

export const DISCIPLINE_CATEGORIES: PortfolioCategory[] = [
  "All Work",
  "Character Design",
  "3D Models",
  "Video Editing",
  "Website Development",
  "Graphic Design",
  "Branding",
  "3D Animation",
  "UI/UX Design",
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "work-01",
    title: "Obsidian Sentinel Study",
    category: "3D Models",
    description:
      "Hard-surface 3D model study exploring reflective obsidian materials, specular chrome highlights, and concentrated crimson visor illumination.",
    imageSrc: "/portfolio/work-01.webp",
    imageAlt:
      "Futuristic reflective black android with a glowing crimson visor against a dark void",
    width: 800,
    height: 1040,
  },
  {
    id: "work-07",
    title: "Acoustic & Optical Sensor Study",
    category: "Character Design",
    description:
      "Cybernetic character profile and helmet study focusing on precision-machined dark alloy and crimson optical ring accents.",
    imageSrc: "/portfolio/work-07.webp",
    imageAlt:
      "Side profile close-up of a sleek black helmet with a glowing red circular side module",
    width: 800,
    height: 1040,
  },
  {
    id: "work-02",
    title: "Crimson Threshold",
    category: "Branding",
    description:
      "Signature visual direction for the VISYNTH studio identity—contrasting architectural monoliths with a luminous crimson ring.",
    imageSrc: "/portfolio/work-02.webp",
    imageAlt:
      "Silhouette approaching a glowing red circular portal over wet reflective stone",
    width: 800,
    height: 1040,
  },
  {
    id: "work-03",
    title: "Momentum in Red Ink",
    category: "Graphic Design",
    description:
      "Hand-drawn ink and crimson line study illustrating disciplined creative effort pushing complex form uphill.",
    imageSrc: "/portfolio/work-03.webp",
    imageAlt:
      "Minimalist hand-drawn figure pushing a large tangled red sphere up an incline",
    width: 800,
    height: 1040,
  },
  {
    id: "work-04",
    title: "Optical Core Architecture",
    category: "Video Editing",
    description:
      "Rhythmic cut and colour-grading sequence exploring layered perimeter rings and radial neural filaments.",
    imageSrc: "/portfolio/work-04.webp",
    imageAlt:
      "Close-up of a circular mechanical core with glowing red concentric rings and filaments",
    width: 800,
    height: 1040,
  },
  {
    id: "work-05",
    title: "Nocturnal Transit System",
    category: "3D Animation",
    description:
      "Realtime spatial 3D animation study pairing linear crimson ceiling fixtures with wet tiled platform reflections.",
    imageSrc: "/portfolio/work-05.webp",
    imageAlt:
      "Futuristic subterranean transit station illuminated by red neon ceiling strips",
    width: 800,
    height: 1040,
  },
  {
    id: "work-06",
    title: "Radial Signal Convergence",
    category: "Website Development",
    description:
      "High-contrast interactive web canvas sequence engineered for scroll-synchronized browser playback.",
    imageSrc: "/portfolio/work-06.webp",
    imageAlt:
      "Radial burst of crimson light filaments converging toward a dark center",
    width: 800,
    height: 1040,
  },
  {
    id: "work-08",
    title: "Structural Thread Synthesis",
    category: "Graphic Design",
    description:
      "Transitional illustration study bridging procedural energy filaments and expressive hand-drawn red linework.",
    imageSrc: "/portfolio/work-08.webp",
    imageAlt:
      "Luminous red filaments weaving into a dense hand-drawn crimson sphere",
    width: 800,
    height: 1040,
  },
  {
    id: "work-09",
    title: "Reflective Corridor Grid",
    category: "UI/UX Design",
    description:
      "Spatial perspective grid and dark-mode visual hierarchy study informing VISYNTH's interactive interface system.",
    imageSrc: "/portfolio/work-09.webp",
    imageAlt:
      "Perspective view of a dark transit car alongside a crimson-reflected platform floor",
    width: 800,
    height: 1040,
  },
];

export const AVAILABLE_CATEGORIES: PortfolioCategory[] = DISCIPLINE_CATEGORIES;
