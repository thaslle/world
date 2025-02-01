export const varyingVertexShader = {
  search: `#include <common>`,
  replace: `
      varying vec3 vPositionW;

      #include <common>
      `,
}

export const mainVertexShader = {
  search: `#include <fog_vertex>`,
  replace: `
      #include <fog_vertex>
      vPositionW = worldPosition.xyz;
      `,
}

export const varyingFragmentShader = {
  search: `#include <common>`,
  replace: `
      #include <common>
      varying vec3 vPositionW;

      uniform float uTime;
      uniform float uWaterHeight;
      `,
}

export const mainFragmentShader = {
  search: `#include <dithering_fragment>`,
  replace: `
    vec4 baseColor = gl_FragColor; // Existing material color
    
    // Modify the y position based on sine function, oscillating up and down over time
    float sineOffset = sin(uTime * 1.2) * 0.1;  // 1.2 controls the speed, 0.1 controls the amplitude

    // The current dynamic water height
    float waterDepth = 0.05;
    float currentWaterHeight = uWaterHeight + sineOffset;

    float stripe = smoothstep((currentWaterHeight + 0.01), (currentWaterHeight - 0.01), vPositionW.y)
                - smoothstep((currentWaterHeight + waterDepth + 0.01), (currentWaterHeight + waterDepth - 0.01), vPositionW.y);

    vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe

    vec3 finalColor = mix(baseColor.rgb - stripe, stripeColor, stripe);
    
    gl_FragColor = vec4(finalColor, baseColor.a);

    #include <dithering_fragment>
    `,
}

