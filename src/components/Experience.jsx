import { Environment } from "@react-three/drei";

import { useControls } from "leva";

import { Grass } from "./Grass";
import { Level } from "./Level";
import { Player } from "./Player";

export const Experience = () => {
  const { BACKGROUND } = useControls("Sky", {
    BACKGROUND: "#d9ffe8",
  });

  return (
    <>
      <Environment preset="dawn" />
      <ambientLight intensity={1.8} />

      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 65, 90]} />

      <Player />
      <Grass />
      <Level />
    </>
  );
};
