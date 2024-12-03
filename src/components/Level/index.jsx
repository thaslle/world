import { RigidBody } from "@react-three/rapier";
import { useControls } from "leva";

export const Level = () => {
  const { COLOR } = useControls("Ground", {
    COLOR: "#75a706",
  });

  return (
    <RigidBody type="fixed" name="terrain" friction={2}>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[200, 0.2, 200]} />
        <meshStandardMaterial color={COLOR} />
      </mesh>
    </RigidBody>
  );
};
