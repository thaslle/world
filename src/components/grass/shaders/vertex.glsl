#define M_PI 3.1415926535897932384626433832795

#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>

uniform float uTime;
uniform float uGrassDistance;
uniform vec3 uPlayerPosition;
uniform float uTerrainSize;
uniform float uTerrainTextureSize;
uniform sampler2D uTerrainTexture;
uniform float uTerrainHeightMax;
uniform vec3 uColor;
uniform vec3 uLightPosition;

attribute vec2 center;

varying vec3 vColor;
varying vec2 vUv;
varying vec2 vGlobalUV;
varying vec3 vNormal;
varying vec3 vViewPosition;

#include "../../../utils/shaders/functions/functions.glsl"
#include "../../../utils/shaders/functions/noise.glsl"

float getGrassAttenuation(vec2 position)
{
    // Calculate the distance attenuation based on distance from the player to the position
    float distanceAttenuation = distance(uPlayerPosition.xz, position) / uGrassDistance * 1.8;
    
    // Attenuation near the center (player position) with a scale factor
    float factor = 0.006;
    float centerAttenuation = smoothstep(0.0, factor, distance(uPlayerPosition.xz, position) / uGrassDistance);

    // Combine both attenuations: distance-based and center-based
    float finalAttenuation = 1.0 - clamp(0.0, 1.0, smoothstep(0.8, 1.0, distanceAttenuation));

    // Apply the center attenuation (reduces as the distance from the player increases)
    finalAttenuation *= centerAttenuation;

    return finalAttenuation;
}


void main()
{
    #include <color_vertex>
        
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>
    
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <worldpos_vertex>
    
    vUv = uv;

    // Recalculate center and keep around player
    vec2 newCenter = center;
    newCenter -= uPlayerPosition.xz;
    float halfSize = uGrassDistance * 0.5;
    newCenter.x = mod(newCenter.x + halfSize, uGrassDistance) - halfSize;
    newCenter.y = mod(newCenter.y + halfSize, uGrassDistance) - halfSize; // Y considered as Z
    vec4 modelCenter = modelMatrix * vec4(newCenter.x, 0.0, newCenter.y, 1.0);

    // Move grass to center
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.xz += newCenter; // Y considered as Z
    
    // Rotate blade to face camera
    float angleToCamera = atan((modelCenter.x - cameraPosition.x) * 2.0, (modelCenter.z - cameraPosition.z) * 2.0);
    modelPosition.xz = getRotatePivot2d(modelPosition.xz, angleToCamera, modelCenter.xz);
    
    // Apply Heightmap
    // Normalize model position to terrain space (world space to terrain space)
    vec2 terrainUv = (modelPosition.xz + (uTerrainSize * 0.5)) / uTerrainSize;

    // Sample the terrain texture using the adjusted UVs
    float fragmentSize = 1.0 / uTerrainTextureSize;
    vec4 terrainColor = texture2D(uTerrainTexture, terrainUv * (1.0 - fragmentSize) + fragmentSize * 0.5);

    // Normalize the height using the min and max height values
    float height = terrainColor.a * uTerrainHeightMax;
    
    // Apply the height to the model's position
    modelPosition.y += height - 0.20;  // Adjust the model's y-coordinate based on the heightmap
    
    // Update the model center's y position for correct rendering
    modelCenter.y += height - 0.20;

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    // Attenuation
    float distanceScale = getGrassAttenuation(modelCenter.xz);
    float slopeScale = smoothstep(remap(slope, 0.3, 0.8, 1.0, 0.0), 0.0, 1.0);
    float scale = distanceScale * slopeScale * smoothstep(0.3, 0.8, terrainColor.g);
    modelPosition.xyz = mix(modelCenter.xyz, modelPosition.xyz, scale);

    // Tipness
    float tipness = step(2.0, mod(float(gl_VertexID) + 1.0, 3.0));

    // Wind
    vec2 noiseUv = modelPosition.xz * 0.09 + uTime * 0.2;
    vec4 noiseColor = vec4(noise(noiseUv));
    modelPosition.x += (noiseColor.x - 0.4) * tipness * scale * 0.2;
    modelPosition.z += (noiseColor.y - 0.4) * tipness * scale * 0.2;

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Grass color
    //vec3 uGrassDefaultColor = vec3(0.69, 0.83, 0.38);
    //vec3 uGrassShadedColor = vec3(0.69 / 1.18, 0.83 / 1.18, 0.38 / 1.18);
    
    vec3 uGrassDefaultColor = uColor;
    vec3 uGrassShadedColor = uColor / 1.18;

    //float shadowIntensity = 0.3;
    //vec3 shadowedColor = uGrassShadedColor * getShadowColor(modelCenter.xz);
    //uGrassShadedColor = mix(uGrassShadedColor, shadowedColor, shadowIntensity);

    vec3 lowColor = mix(uGrassShadedColor, uGrassDefaultColor, 1.0 - scale); // Match the terrain
    vec3 color = mix(lowColor, uGrassDefaultColor, tipness);

    vColor = color;
    vNormal = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));

    vec4 vModelPosition = modelMatrix * vec4(position, 1.0);
    vModelPosition.xz += newCenter; // Move grass to center around the player
    vModelPosition.y += height;     // Adjust the Y position based on the heightmap
    
    // Store the world position in the varying
    vViewPosition = vModelPosition.xyz;


    // Based on #include <shadowmap_vertex>
    #if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )

        vec3 shadowWorldNormal = inverseTransformDirection( vNormal, viewMatrix );
        vec4 shadowWorldPosition;

    #endif

    #if defined( USE_SHADOWMAP )

        #if NUM_DIR_LIGHT_SHADOWS > 0

            #pragma unroll_loop_start
            for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {

                shadowWorldPosition = modelPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
                vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;

            }
            #pragma unroll_loop_end

        #endif
    #endif

}