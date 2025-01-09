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

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vPositionW;
varying vec3 vNormalW;

#include "../../../../utils/shaders/functions.glsl"
#include "../../../../utils/shaders/noise.glsl"
#include "../../../../utils/shaders/snoise.glsl"
#include "../../../../utils/shaders/fbm.glsl"
#include "../../../../utils/shaders/grass.glsl"
#include "../../../../utils/shaders/sand.glsl"

void main()
{

    // Base color of the material (e.g., grass)
    vec3 baseColor = sand(vUv, uGroundColor);

    // Read the vertex color
    vec3 color = vColor.rgb;
    
    // Apply custom color rules based on vertex color
    if (color.g > 0.1) {
        // Green color (apply Grass Texture)
        vec3 mixColor = grass(vUv, uGrassColor);
        float th = smoothstep(0.0, 0.6, color.g);

        // Noise edges
        float vNoise = snoise(vUv * 100.0);
        float baseEdge = mix(0.0, mix(vNoise, 1.0, th), th);
        baseEdge = smoothstep(0.3, 0.7, baseEdge);
        
        baseColor = mix(baseColor, mixColor, baseEdge);
    } else if (color.r > 0.1) {
        // Red color (apply Rock Texture)
        baseColor = uRockColor;
    } else if (color.b > 0.1) {
        // Blue color (apply Snow Texture)
        baseColor = uSnowColor;
    }

    vec3 ambientLightColor = vec3(0.8);
    vec3 ambient = 0.85 * ambientLightColor;
    
    // Diffuse lighting
    vec3 lightDir = normalize(uLightPosition - vPositionW); // Light direction
    float diff = max(dot(vNormalW, lightDir), 0.0); // Lambertian reflection
    vec3 diffuse = diff * uLightColor;

    // Combine ambient and diffuse
    vec3 finalColor = ambient + diffuse;

    finalColor = finalColor * baseColor;

    gl_FragColor = vec4(finalColor, 1.0);
}