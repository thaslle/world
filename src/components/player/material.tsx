import { MeshStandardMaterial, Texture } from 'three'

import { settings } from '~/config/settings'

type PlayerMaterialProps = {
  map: Texture | null
}

const PlayerMaterial = ({ map }: PlayerMaterialProps) => {
  const playerMaterial = new MeshStandardMaterial({
    map: map,
  })

  playerMaterial.onBeforeCompile = (shader) => {
    // Declare the new uniform
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uWaterHeight = { value: settings.waterHeight }

    playerMaterial.userData.shader = shader

    // Inject custom varyings into the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      `#include <common>`,
      `
        #include <common>
        varying vec3 vPositionW;
        varying vec3 vNormalW;
        `,
    )

    // Calculate world position and normal in the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `
        #include <begin_vertex>
        vPositionW = (modelMatrix * vec4(position * 100.0, 1.0)).xyz;
        `,
    )

    // Inject custom varyings and Fresnel logic into the fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <common>`,
      `
        #include <common>
        varying vec3 vPositionW;

        uniform float uTime;
        uniform float uWaterHeight;
        `,
    )

    // Add Fresnel effect logic while preserving the original texture
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `
        vec4 baseColor = gl_FragColor; // Existing material color
        
        // Modify the y position based on sine function, oscillating up and down over time
        float sineOffset = sin(uTime * 1.2) * 0.1;  // 1.2 controls the speed, 0.1 controls the amplitude

        // The current dynamic water height
        float waterDepth = 0.05;
        float currentWaterHeight = uWaterHeight + sineOffset;
        
        // float stripe = smoothstep((currentWaterHeight + 0.01) * 0.01, (currentWaterHeight - 0.01) * 0.01, vPositionW.y)
        //              - smoothstep((currentWaterHeight + waterDepth + 0.01) * 0.01, (currentWaterHeight + waterDepth - 0.01) * 0.01, vPositionW.y);

        float stripe = smoothstep((currentWaterHeight + 0.01), (currentWaterHeight - 0.01), vPositionW.x)
                     - smoothstep((currentWaterHeight + waterDepth + 0.01), (currentWaterHeight + waterDepth - 0.01), vPositionW.x);

        vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe

        //vec3 finalColor = mix(baseColor.rgb - stripe, stripeColor, stripe);
        vec3 finalColor = baseColor.rgb;

        gl_FragColor = vec4(finalColor, baseColor.a);

        #include <dithering_fragment>
        `,
    )
  }

  return playerMaterial
}

export default PlayerMaterial
