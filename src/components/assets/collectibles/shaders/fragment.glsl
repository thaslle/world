uniform float uTime;
uniform float uWaterHeight;

varying vec2 csm_vUv;
varying vec3 csm_vColor;
varying vec3 csm_vPositionW;
varying vec3 csm_vNormalW;

void main()
{
  vec4 baseColor = vec4(csm_vColor, 1.0);

  // Modify the y position based on sine function, oscillating up and down over time
  float sineOffset = sin(uTime * 1.2) * 0.1;  // 1.2 controls the speed, 0.1 controls the amplitude

  // The current dynamic water height
  float waterDepth = 0.02;
  float currentWaterHeight = uWaterHeight + sineOffset;

  float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, csm_vPositionW.y)
                - smoothstep(currentWaterHeight + waterDepth + 0.01, currentWaterHeight + waterDepth - 0.01, csm_vPositionW.y);

  vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe

  vec3 finalColor = mix(baseColor.rgb - stripe, stripeColor, stripe);
  
  csm_FragColor = vec4(finalColor, baseColor.a);
}