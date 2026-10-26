import ReactDOM from "react-dom";
import { CinematicExperience } from "@/components/CinematicExperience";

export default function Home() {
  ReactDOM.preload("/frames/frame_001.webp", {
    as: "image",
    fetchPriority: "high",
  });
  return <CinematicExperience />;
}
