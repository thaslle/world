varying vec2 csm_vUv;
varying vec3 csm_vColor;
varying vec3 csm_vPositionW;
varying vec3 csm_vNormalW;

void main() {
    csm_vUv = uv;
    csm_vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    csm_vNormalW = normalize(mat3(modelMatrix) * normal);
}