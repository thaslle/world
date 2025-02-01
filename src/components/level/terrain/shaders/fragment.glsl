#ifdef GL_ES
precision mediump float;
#endif

// Uniforms for light and camera
uniform float uTime;
uniform vec3 uGroundColor;
uniform vec3 uGrassColor;
uniform vec3 uSnowColor;
uniform vec3 uRockColor;
uniform vec3 uOceanColor;
uniform float uWaterHeight;

varying vec2 csm_vUv;
varying vec3 csm_vColor;
varying vec3 csm_vPositionW;
varying vec3 csm_vNormalW;

#include <shadowmask_pars_fragment>

#include "../../../../utils/shaders/functions/functions.glsl"
#include "../../../../utils/shaders/functions/noise.glsl"
#include "../../../../utils/shaders/functions/snoise.glsl"
#include "../../../../utils/shaders/functions/fbm.glsl"
#include "../../../../utils/shaders/functions/cloud.glsl"
#include "../../../../utils/shaders/functions/cellular.glsl"

#include "../../../../utils/shaders/materials/grass.glsl"
#include "../../../../utils/shaders/materials/sand.glsl"
#include "../../../../utils/shaders/materials/rock.glsl"

void main()
{

    // Base color of the material (e.g., grass)
    //Darken color by depth
    float heightFactor = smoothstep(5.1, 1.2, csm_vPositionW.y);
    vec3 baseColor = mix(uGroundColor, uGroundColor * 0.8, heightFactor);

    float vnoise = noise(csm_vUv * 50.0);
    float vsnoise = snoise(csm_vUv * 800.0);
    float vfbm = fbm(csm_vUv * 60.0);

    //Sand texture
    //baseColor = sand(csm_vUv, baseColor);
    baseColor = sand(baseColor, vnoise, vsnoise, vfbm);
    
    // Read the vertex color
    vec3 color = csm_vColor.rgb;
    
    // Apply custom color rules based on vertex color
    // Red Vertex Color

    // Rock texture
    vec3 baseRockColor = rock(csm_vUv, uRockColor, vsnoise);

    float rockBlendFactor = smoothstep(0.1, 0.2, color.r);
    baseColor = mix(baseColor, baseRockColor, rockBlendFactor);

    // Blue Vertex Color
    float colorGB = min(color.g + color.b, 1.0);
    
    // Green Vertex Color
    // Compute the blend factor based on the green channel (color.g)
    float grassBlendFactor = smoothstep(0.1, 0.2, colorGB);

    // Grass texture
    vec3 baseGrassColor = grass(uGrassColor, vnoise, vsnoise, vfbm);

    // Threshold for grass texture effect
    float grassThreshold = smoothstep(0.0, 0.6, colorGB);


    // Generate noise for edge effect
    float edgeNoise = snoise(csm_vUv * 100.0);
    
    float baseEdge = mix(0.0, mix(edgeNoise, 1.0, grassThreshold), grassThreshold);
    baseEdge = smoothstep(0.3, 0.7, baseEdge);

    // Blend between base color and grass color based on the edge effect and grass blend factor
    baseColor = mix(baseColor, baseGrassColor, baseEdge * grassBlendFactor);

    // Ocean Bottom
    float vignette = length(csm_vUv - 0.5) * 1.5;
    vec3 vignetteFactor = smoothstep(0.3, 0.9, vec3(vignette));
    
    float oceanFactor = smoothstep(0.8, 0.0, csm_vPositionW.y);
    baseColor = mix(baseColor, uOceanColor, oceanFactor * min(vignetteFactor + 0.3, 1.0));

    float shadowIntensity = 0.3;
    vec3 shadowedColor = baseColor * getShadowMask();
    vec3 finalColor = mix(baseColor, shadowedColor, shadowIntensity);

    // Modify the y position based on sine function, oscillating up and down over time
    float sineOffset = sin(uTime * 1.2) * 0.1;  // 1.2 controls the speed, 0.1 controls the amplitude

    // The current dynamic water height
    float waterDepth = 0.05;
    float currentWaterHeight = uWaterHeight + sineOffset;

    float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, csm_vPositionW.y)
                 - smoothstep(currentWaterHeight + waterDepth + 0.01, currentWaterHeight + waterDepth - 0.01, csm_vPositionW.y);

    vec3 stripeColor = vec3(1.0, 1.0, 1.0); // White stripe

    finalColor = mix(finalColor - stripe, stripeColor, stripe);
    
    csm_FragColor = vec4(finalColor, 1.0);
}