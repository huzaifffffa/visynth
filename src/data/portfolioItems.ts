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
  discipline: string;
  serviceProvided: string;
  projectObjective: string;
  projectType: "Concept study" | "Experimental study" | "Studio project";
  description: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  galleryImages?: string[];
  cleanCard?: boolean;
  externalUrl?: string;
  externalLabel?: string;
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
    id: "work-procida",
    title: "Procida Coastal Dining",
    category: "Video Editing",
    discipline: "Commercial Film Direction, Edit & Color Grading",
    serviceProvided: "Brand Film Production, Sound Design & Visual Storytelling",
    projectObjective:
      "Capture the coastal Neapolitan and Sicilian soul of Procida Restaurant through intimate culinary cinematography, rhythmic editorial pacing, and warm Mediterranean color grading.",
    projectType: "Studio project",
    description:
      "Bespoke brand film created for Procida Restaurant (New Orleans)—showcasing handcrafted coastal Italian cuisine, artisanal pasta preparation, and warm volcanic-island hospitality through dynamic motion and rich sensory grading.",
    imageSrc: "/portfolio/work-01.webp",
    imageAlt:
      "Cinematic culinary brand film for Procida Italian Restaurant",
    videoSrc: "/portfolio/procida.mp4",
    externalUrl: "https://procidarestaurant.com/",
    externalLabel: "Visit Procida",
    width: 1080,
    height: 1920,
  },
  {
    id: "work-aume",
    title: "AUMÉ Naturals — Purity Meets Prestige",
    category: "Branding",
    discipline: "AI Content Creation, Brand Direction & Editorial Design",
    serviceProvided: "Campaign Visual Suite, Product Art Direction & Social Creatives",
    projectObjective:
      "Elevate AUMÉ Naturals' 12-ingredient botanical Hair Treatment Oil into a quiet-luxury personal care ritual through editorial campaign imagery, tactile typography, and cohesive art direction.",
    projectType: "Studio project",
    description:
      "Complete visual campaign suite crafted for AUMÉ Naturals (aumenaturals.com) highlighting their signature 12-oil botanical Hair Treatment Oil. Built around deep forest greens, warm apothecary amber glass, and refined serif typography under the brand ethos 'Where Purity Meets Prestige — A Ritual, Not a Routine.'",
    imageSrc: "/portfolio/aume-1.png",
    imageAlt:
      "AUMÉ Naturals Hair Treatment Oil editorial campaign poster — Where Purity Meets Prestige",
    galleryImages: [
      "/portfolio/aume-1.png",
      "/portfolio/aume-2.png",
      "/portfolio/aume-3.png",
    ],
    cleanCard: true,
    externalUrl: "https://aumenaturals.com/",
    externalLabel: "Visit AUMÉ Naturals",
    width: 1080,
    height: 1350,
  },
  {
    id: "work-01",
    title: "Obsidian Sentinel Study",
    category: "3D Models",
    discipline: "3D modelling and surface design",
    serviceProvided: "Hard-surface model and material study",
    projectObjective:
      "Develop a hard-surface character study with controlled reflections, crisp edge highlights and a focused red visor.",
    projectType: "Experimental study",
    description:
      "A hard-surface character study focused on black reflective materials, chrome edges and a single red visor.",
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
    discipline: "Character concept and hard-surface detail",
    serviceProvided: "Form development and industrial detailing",
    projectObjective:
      "Shape a clear helmet silhouette that combines believable proportions with integrated optical and communication hardware.",
    projectType: "Concept study",
    description:
      "A cybernetic helmet study built around machined dark metal and a restrained red optical detail.",
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
    discipline: "Brand identity and visual language",
    serviceProvided: "Identity system and key visuals",
    projectObjective:
      "Define a recognizable VISYNTH visual language using dark architectural forms and a single red focal point.",
    projectType: "Studio project",
    description:
      "A VISYNTH identity study built around dark architectural forms and a red circular portal.",
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
    discipline: "Editorial illustration and linework",
    serviceProvided: "Original artwork and narrative illustration",
    projectObjective:
      "Show the effort behind difficult creative work through a simple figure, a steep incline and an unruly red form.",
    projectType: "Concept study",
    description:
      "A hand-drawn study about the persistence it takes to move a difficult idea forward.",
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
    discipline: "Motion graphics and colour grading",
    serviceProvided: "Sequence editing and colour treatment",
    projectObjective:
      "Use pacing, focal changes and colour to pull attention toward the centre of a mechanical form.",
    projectType: "Experimental study",
    description:
      "A motion study using rhythmic cuts, concentric rings and controlled red highlights.",
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
    discipline: "3D environment and spatial lighting",
    serviceProvided: "Environment layout and lighting",
    projectObjective:
      "Create a believable underground space using simple geometry, damp surfaces and linear red lighting.",
    projectType: "Studio project",
    description:
      "A real-time 3D environment study of an underground platform lit by red ceiling strips.",
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
    discipline: "Creative web development",
    serviceProvided: "Interactive canvas and scroll-led animation",
    projectObjective:
      "Build a scroll-led canvas sequence that stays responsive across desktop and mobile layouts.",
    projectType: "Studio project",
    description:
      "An interactive web sequence that connects page movement to a high-contrast canvas animation.",
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
    discipline: "Digital print and vector graphics",
    serviceProvided: "Pattern design and vector composition",
    projectObjective:
      "Explore the point where a rigid digital grid gives way to loose, hand-drawn texture.",
    projectType: "Experimental study",
    description:
      "An illustration study that moves from precise digital lines into a dense, hand-drawn red form.",
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
    discipline: "Spatial design and dark interface hierarchy",
    serviceProvided: "Interface depth and contrast system",
    projectObjective:
      "Test how contrast, depth and red lighting cues can guide attention in a dark interface.",
    projectType: "Studio project",
    description:
      "A dark interface study using perspective, reflection and red light to establish hierarchy.",
    imageSrc: "/portfolio/work-09.webp",
    imageAlt:
      "Perspective view of a dark transit car alongside a crimson-reflected platform floor",
    width: 800,
    height: 1040,
  },
];

