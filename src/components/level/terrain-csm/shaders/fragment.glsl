#ifdef GL_ES
precision mediump float;
#endif

// Uniforms for light and camera
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uGroundColor;
uniform vec3 uGrassColor;
uniform vec3 uSnowColor;
uniform vec3 uRockColor;
uniform vec3 uOceanColor;

varying vec2 csm_vUv;
varying vec3 csm_vColor;
varying vec3 csm_vPositionW;
varying vec3 csm_vNormalW;

#include "../../../../utils/shaders/functions.glsl"
#include "../../../../utils/shaders/noise.glsl"
#include "../../../../utils/shaders/snoise.glsl"
#include "../../../../utils/shaders/fbm.glsl"
#include "../../../../utils/shaders/light.glsl"
#include "../../../../utils/shaders/grass.glsl"
#include "../../../../utils/shaders/sand.glsl"

void main()
{

    // Base color of the material (e.g., grass)
    //Darken color by depth
    float heightFactor = smoothstep(5.1, 1.2, csm_vPositionW.y);
    vec3 baseColor = mix(uGroundColor, uGroundColor * 0.8, heightFactor);

    //Sand texture
    baseColor = sand(csm_vUv, baseColor);

    // Read the vertex color
    vec3 color = csm_vColor.rgb;
    
    // Apply custom color rules based on vertex color
    
    // Green Vertex Color
    // Compute the blend factor based on the green channel (color.g)
    float grassBlendFactor = smoothstep(0.1, 0.2, color.g);

    // Grass texture
    vec3 baseGrassColor = grass(csm_vUv, uGrassColor);

    // Threshold for grass texture effect
    float grassThreshold = smoothstep(0.0, 0.6, color.g);

    // Generate noise for edge effect
    float vNoise = snoise(csm_vUv * 100.0);
    float baseEdge = mix(0.0, mix(vNoise, 1.0, grassThreshold), grassThreshold);
    baseEdge = smoothstep(0.3, 0.7, baseEdge);

    // Blend between base color and grass color based on the edge effect and grass blend factor
    baseColor = mix(baseColor, baseGrassColor, baseEdge * grassBlendFactor);

    // Red Vertex Color
    float rockBlendFactor = smoothstep(0.1, 0.2, color.r);
    baseColor = mix(baseColor, uRockColor, rockBlendFactor);

    // Blue Vertex Color
    float snowBlendFactor = smoothstep(0.1, 0.2, color.b);
    baseColor = mix(baseColor, uSnowColor, snowBlendFactor);

    // Ocean Bottom
    float oceanFactor = smoothstep(1.5, 0.0, csm_vPositionW.y);
    baseColor = mix(baseColor, uOceanColor, oceanFactor);
    

    // Lights
    vec3 lightsColor = light(uLightPosition, csm_vPositionW, csm_vNormalW, uLightColor);
    vec3 finalColor = lightsColor * baseColor;

    finalColor = baseColor;

    csm_FragColor = vec4(finalColor, 1.0);
}