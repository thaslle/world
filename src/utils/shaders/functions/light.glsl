vec3 light(in vec3 uLightPosition, in vec3 vPositionW, in vec3 vNormalW, in vec3 uLightColor) {
    
    vec3 ambientLightColor = vec3(0.8);
    vec3 ambient = 0.95 * ambientLightColor;
    
    // Diffuse lighting
    vec3 lightDir = normalize(uLightPosition - vPositionW); // Light direction
    float diff = max(dot(vNormalW, lightDir), 0.0); // Lambertian reflection
    vec3 diffuse = diff * uLightColor * 0.65;

    // Combine ambient and diffuse
    vec3 finalColor = ambient + diffuse;

    return finalColor;
}