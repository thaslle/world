#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 uGroundColor;

varying vec2 csm_vUv;
varying vec3 csm_vPositionW;
varying vec3 csm_vNormalW;

#include <shadowmask_pars_fragment>

void main()
{

    //Base Color
    vec3 baseColor = uGroundColor;

    float shadowIntensity = 0.5;
    vec3 shadowedColor = baseColor * getShadowMask();
    vec3 finalColor = mix(baseColor, shadowedColor, shadowIntensity);

    csm_FragColor = vec4(finalColor, 1.0);
}