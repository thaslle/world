import { RigidBody } from "@react-three/rapier";
import { Terrain } from "./Terrain";

export const Level = () => {
  return (
    <RigidBody
      type="fixed"
      name="terrain"
      // friction={2}
      colliders="trimesh"
    >
      <Terrain />
      {/* <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[200, 0.2, 200]} />
        <meshStandardMaterial color={"#75a706"} />
      </mesh> */}
    </RigidBody>
  );
};
