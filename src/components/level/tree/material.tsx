import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, MeshMatcapMaterial } from 'three'

import alphaMapPath from './materials/alpha-map.png'
import matcapPath from './materials/matcap-tree.jpg'

const LeafMaterial = () => {
  const alphaMap = useTexture(alphaMapPath)
  const matCapMap = useTexture(matcapPath)

  const leafMaterial = new MeshMatcapMaterial({
    matcap: matCapMap,
    alphaMap: alphaMap,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  })

  useFrame(({ clock }) => {
    if (!leafMaterial.userData.shader) return
    leafMaterial.userData.shader.uniforms.uWindTime.value =
      clock.getElapsedTime()
  })

  leafMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = { value: 0.0 }
    leafMaterial.userData.shader = shader

    // Inject custom varyings into the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      `#include <common>`,
      `
        #include <common>

        uniform float uWindTime;
        
        float uEffectBlend = 1.2;
        float uInflate = 1.2;
        float uScale = 1.1;
        float uWindSpeed = 0.8;
        
        float inverseLerp(float v, float minValue, float maxValue) {
          return (v - minValue) / (maxValue - minValue);
        }

        float remap(float v, float inMin, float inMax, float outMin, float outMax) {
          float t = inverseLerp(v, inMin, inMax);
          return mix(outMin, outMax, t);
        }

        mat4 rotateZ(float radians) {
          float c = cos(radians);
          float s = sin(radians);

          return mat4(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
          );
        }

        vec4 applyWind(vec4 v) {
          float boundedYNormal = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
          float posXZ = position.x + position.z;
          float power = uWindSpeed / 5.0 * -0.5;

          float topFacing = remap(sin(uWindTime + posXZ), -1.0, 1.0, 0.0, power);
          float bottomFacing = remap(cos(uWindTime + posXZ), -1.0, 1.0, 0.0, 0.05);
          float radians = mix(bottomFacing, topFacing, boundedYNormal);

          return rotateZ(radians) * v;
        }

        vec2 calcInitialOffsetFromUVs() {
          vec2 offset = vec2(
            remap(uv.x, 0.0, 1.0, -1.0, 1.0),
            remap(uv.y, 0.0, 1.0, -1.0, 1.0)
          );

          // Invert the vertex offset so it's positioned towards the camera.
          offset *= vec2(-1.0, 1.0);
          offset = normalize(offset) * uScale;

          return offset;
        }

        vec3 inflateOffset(vec3 offset) {
          return offset + normal.xyz * uInflate;
        }
        `,
    )

    // Calculate world position and normal in the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      `#include <fog_vertex>`,
      `
        #include <fog_vertex>
  
        vec2 vertexOffset = calcInitialOffsetFromUVs();

        vec3 inflatedVertexOffset = inflateOffset(vec3(vertexOffset, 0.0));

        vec4 worldViewPosition = modelViewMatrix * vec4(position, 1.0);

        worldViewPosition += vec4(mix(vec3(0.0), inflatedVertexOffset, uEffectBlend), 0.0);

        worldViewPosition = applyWind(worldViewPosition);

        gl_Position = projectionMatrix * worldViewPosition;
        `,
    )
  }

  return leafMaterial
}

export default LeafMaterial
