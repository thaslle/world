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

varying vec3 vColor;
varying vec2 vUv;

// Classic Perlin 2D noise
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float perlinNoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
                      0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
                      -0.577350269189626, // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

// float getGrassAttenuation(vec2 position)
// {
//     float distanceAttenuation = distance(uPlayerPosition.xz, position) / uGrassDistance * 2.0;
//     return 1.0 - clamp(0.0, 1.0, smoothstep(0.3, 1.0, distanceAttenuation));
// }

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

vec2 getRotatePivot2d(vec2 uv, float rotation, vec2 pivot)
{
    return vec2(
        cos(rotation) * (uv.x - pivot.x) + sin(rotation) * (uv.y - pivot.y) + pivot.x,
        cos(rotation) * (uv.y - pivot.y) - sin(rotation) * (uv.x - pivot.x) + pivot.y
    );
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
    modelCenter.y += height;

    vec3 normal = vec3(1.0, 1.0, 1.0);

    // Slope
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    // Attenuation
    float distanceScale = getGrassAttenuation(modelCenter.xz);
    float slopeScale = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float scale = distanceScale * slopeScale;
    modelPosition.xyz = mix(modelCenter.xyz, modelPosition.xyz, scale);

    // Tipness
    float tipness = step(2.0, mod(float(gl_VertexID) + 1.0, 3.0));

    // Wind
    vec2 noiseUv = modelPosition.xz * 0.08 + uTime * 0.2;
    vec4 noiseColor = vec4(perlinNoise(noiseUv));
    modelPosition.x += (noiseColor.x - 0.2) * tipness * scale * 0.1;
    modelPosition.z += (noiseColor.y - 0.2) * tipness * scale * 0.1;

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