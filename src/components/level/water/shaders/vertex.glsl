#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying float vFogDepth;

uniform float uTime;

#include <fog_pars_vertex>

void main() {
  
  vUv = uv;

  // Modify the y position based on sine function, oscillating up and down over time
  float sineOffset = sin(uTime * 1.2) * 0.1;  // 1.2 controls the speed, 0.1 controls the amplitude

  // Apply the sine offset to the y component of the position
  vec3 modifiedPosition = position;
  modifiedPosition.z += sineOffset; // z used as y because element is rotated
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(modifiedPosition, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(modifiedPosition.xyz, 1.0);

  vFogDepth = - mvPosition.z;
  
}