uniform bool uHover;

varying vec2 csm_vUv;
varying vec3 csm_vColor;
varying vec3 csm_vPositionW;
varying vec3 csm_vNormalW;

void main()
{
  vec4 baseColor = csm_FragColor;
  vec3 viewDirectionW = normalize(cameraPosition - csm_vPositionW);
  viewDirectionW.y = viewDirectionW.y - 0.1;
  viewDirectionW.x = viewDirectionW.x - 0.1;

  float apply = uHover ? 1.0 : 0.0;
  vec3 rimHoverColor = vec3(1.0, 0.0, 0.0);
  vec3 rimColor = mix(baseColor.rgb, rimHoverColor, apply);
  float rimStrength = 2.0;
  float rimWidth = 0.8;

  float fresnelDotV = max(0.0, rimWidth - clamp(dot(viewDirectionW, csm_vNormalW), 0.0, 1.0));
  vec3 fresnelTerm = fresnelDotV * rimColor * rimStrength;

  // Combine Fresnel effect with the base color
  vec3 fresnelColor = mix(baseColor.rgb, vec3(0.8), fresnelTerm);

  csm_FragColor = vec4(fresnelColor, baseColor.a);
}