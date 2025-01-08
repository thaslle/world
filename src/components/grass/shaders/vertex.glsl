#define M_PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uGrassDistance;
uniform vec3 uPlayerPosition;
uniform float uTerrainSize;
uniform float uTerrainTextureSize;
uniform sampler2D uTerrainTexture;
uniform float uTerrainHeightMin;
uniform float uTerrainHeightMax;
uniform vec3 uColor;

attribute vec2 center;
attribute vec3 a_normal;  

varying vec3 vColor;
varying vec2 vUv;

#include "../../../utils/shaders/functions.glsl"
#include "../../../utils/shaders/noise.glsl"

float getGrassAttenuation(vec2 position)
{
    // Calculate the distance attenuation based on distance from the player to the position
    float distanceAttenuation = distance(uPlayerPosition.xz, position) / uGrassDistance * 1.9;
    
    // Attenuation near the center (player position) with a scale factor
    float factor = 0.006;
    float centerAttenuation = smoothstep(0.0, factor, distance(uPlayerPosition.xz, position) / uGrassDistance);

    // Combine both attenuations: distance-based and center-based
    float finalAttenuation = 1.0 - clamp(0.0, 1.0, smoothstep(0.3, 1.0, distanceAttenuation));

    // Apply the center attenuation (reduces as the distance from the player increases)
    finalAttenuation *= centerAttenuation;

    return finalAttenuation;
}

void main()
{
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
    float height = (terrainColor.a * (uTerrainHeightMax - uTerrainHeightMin)) - uTerrainHeightMin;
    
    // Apply the height to the model's position
    modelPosition.y += height;  // Adjust the model's y-coordinate based on the heightmap

    // Update the model center's y position for correct rendering
    modelCenter.y += height + 0.1;

    // modelPosition.y *= step(0.5, terrainColor.g);
    // modelCenter.y *= step(0.5, terrainColor.g);

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), a_normal));

    // Attenuation
    float distanceScale = getGrassAttenuation(modelCenter.xz);
    float slopeScale = smoothstep(remap(slope, 0.3, 0.8, 1.0, 0.0), 0.0, 1.0);
    float scale = distanceScale * slopeScale;
    modelPosition.xyz = mix(modelCenter.xyz, modelPosition.xyz, scale);

    // Tipness
    float tipness = step(2.0, mod(float(gl_VertexID) + 1.0, 3.0));

    // Wind
    vec2 noiseUv = modelPosition.xz * 0.08 + uTime * 0.2;
    vec4 noiseColor = vec4(noise(noiseUv));
    modelPosition.x += (noiseColor.x - 0.3) * tipness * scale * 0.2;
    modelPosition.z += (noiseColor.y - 0.3) * tipness * scale * 0.2;

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Grass color
    vec3 uGrassDefaultColor = vec3(0.69, 0.83, 0.38);
    vec3 uGrassShadedColor = vec3(0.69 / 1.18, 0.83 / 1.18, 0.38 / 1.18);

    vec3 lowColor = mix(uGrassShadedColor, uGrassDefaultColor, 1.0 - scale); // Match the terrain
    vec3 color = mix(lowColor, uGrassDefaultColor, tipness);

    vColor = color;
}