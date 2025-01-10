#ifdef GL_ES
precision mediump float;
#endif

// Uniforms for light and camera
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uGroundColor;

varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

#include "../../../../utils/shaders/functions.glsl"
#include "../../../../utils/shaders/noise.glsl"
#include "../../../../utils/shaders/snoise.glsl"
#include "../../../../utils/shaders/fbm.glsl"
#include "../../../../utils/shaders/light.glsl"

void main()
{

    //Base Color
    vec3 baseColor = uGroundColor;

    // Lights
    vec3 lightsColor = light(uLightPosition, vPositionW, vNormalW, uLightColor);

    vec3 finalColor = lightsColor * baseColor;

    gl_FragColor = vec4(finalColor, 1.0);
}