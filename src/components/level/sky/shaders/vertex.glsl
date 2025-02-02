varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

void main() {

    vUv = uv;
    
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}