#define TAU 6.28318530718

uniform vec3 uUpColor;
uniform float uTime;
uniform vec3 uHorizonColor;
uniform float uWaterHeight;

varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;

float wave(float pX)
{
    return 0.6 * (0.5 * sin(0.1 * pX) + 0.5 * sin(0.553 * pX) + 0.7 * sin(1.2 * pX));
}

float waveR(float pX)
{
    return 0.5 + 0.25 * (1.0 + sin(mod(40.0 * pX, TAU)));
}

float draw(vec2 pQ, float pT)
{
    vec2 Qt = 3.5 * pQ;
    pT *= 0.5;
    Qt.x += pT;

    float Xi = floor(Qt.x);
    float Xf = Qt.x - Xi - 0.5;

    vec2 C;
    float Yi;
    float D = 1.0 - step(Qt.y, wave(Qt.x));

    // Disk:
    Yi = wave(Xi + 0.5);
    C = vec2(Xf, Qt.y - Yi); 
    D = min(D, length(C) - waveR(Xi + pT / 80.0));

    // Previous disk:
    Yi = wave(Xi + 1.0 + 0.5);
    C = vec2(Xf - 1.0, Qt.y - Yi); 
    D = min(D, length(C) - waveR(Xi + 1.0 + pT / 80.0));

    // Next Disk:
    Yi = wave(Xi - 1.0 + 0.5);
    C = vec2(Xf + 1.0, Qt.y - Yi); 
    D = min(D, length(C) - waveR(Xi - 1.0 + pT / 80.0));

    return min(1.0, D);
}

void main()
{

    vec3 upColor = uUpColor;
    vec3 horizongColor = uHorizonColor;
    float horizon = smoothstep(uWaterHeight, uWaterHeight + 50.0, vPositionW.y);

    vec3 baseColor = mix(horizongColor, upColor, horizon);

    // Clouds
    vec3 finalColor = baseColor;

    vec2 UV = vUv * 2.0 - 1.0;
    vec2 repeatUV = vec2(UV.x * 38.0, UV.y * 8.0);
    
    // Single Cloud draw
    float cloudTime = uTime * 0.5;
    //vec2 Lp = vec2(0.0, 0.3);
    vec2 Lp = vec2(0.0, -0.2);
    float L = draw(repeatUV + Lp, cloudTime);

    // Blur and color
    float blur = 5.0 * (0.5 * abs(2.0 - 5.0)) / (11.0 - 5.0);  // Set a fixed blur value

    float V = mix(0.0, 1.0, 1.0 - smoothstep(0.0, 0.01 + 0.2 * blur, L));
    vec3 Lc = mix(horizongColor, vec3(1.0), 0.1);  // Use a fixed mix for the cloud color

    // Final Color
    finalColor = mix(finalColor, Lc, V);

    gl_FragColor = vec4(finalColor, 1.0);
}