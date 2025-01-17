vec3 rock(in vec2 vUv, in vec3 baseTint, in float vsnoise) {

    // Dots texture
    float dotsNoise = vsnoise * 0.5 + 0.5;
    vec3 dotsBaseColor = vec3(dotsNoise);
    vec3 dotsEffect = smoothstep(0.08, 0.001, dotsBaseColor);

    // Tint Adjustments
    vec3 dotsTintColor = baseTint - 0.05;   // Slightly darkened dots tint
    vec3 baseColor = mix(baseTint, dotsTintColor, dotsEffect);

    // Rocks texture
    float baseCell = smoothstep(0.3, 0.9, cellular(vec2(vUv.x * 100.0, vUv.y * 70.0)));
    
    vec3 rockEffect = vec3(baseCell * 0.5);
    
    vec3 finalColor = mix(baseColor, baseTint + vec3(0.05, 0.05, 0.0), rockEffect);

    return finalColor;
}
