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

#include "../../../../utils/shaders/functions/functions.glsl"
#include "../../../../utils/shaders/functions/light.glsl"

void main()
{

    //Base Color
    vec3 baseColor = uGroundColor;

    // Lights
    vec3 lightsColor = light(uLightPosition, vPositionW, vNormalW, uLightColor);

    vec3 finalColor = lightsColor * baseColor;

    gl_FragColor = vec4(finalColor, 1.0);
}