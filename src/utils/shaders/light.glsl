// Function to calculate sun shade (light intensity based on surface orientation)
float getSunShade(vec3 normal, vec3 lightDirection)
{
    float sunShade = dot(normal, lightDirection);  // Dot product between normal and light direction
    return (sunShade * 0.5 + 0.5);  // Normalize to [0, 1] range
}

// Function to calculate sun reflection (Fresnel effect)
float getSunReflection(vec3 viewDirection, vec3 worldNormal, vec3 lightDirection)
{
    vec3 lightReflection = reflect(-lightDirection, worldNormal);  // Reflection vector
    float reflectionStrength = max(0.2, dot(lightReflection, viewDirection));  // Measure reflection strength

    // Apply Fresnel effect: more reflection at glancing angles
    float fresnel = 1.0 + dot(viewDirection, worldNormal);
    fresnel = pow(fresnel, 6.0);  // Exponentiate for stronger reflection effect

    return fresnel * reflectionStrength;
}

// Function to apply sun reflection color (white highlight based on reflection)
vec3 getSunReflectionColor(vec3 baseColor, float sunReflection)
{
    return mix(baseColor, vec3(1.0, 1.0, 1.0), clamp(sunReflection, 0.0, 1.0));  // Mix base color with white
}

vec3 getSunShadeColor(vec3 baseColor, float sunShade)
{
    vec3 shadeColor = baseColor * vec3(0.0, 0.5, 0.7);
    return mix(baseColor, shadeColor, sunShade);
}