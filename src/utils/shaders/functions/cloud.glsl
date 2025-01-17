float cloud(vec2 st) {
    float n = 0.0;
    for (float i = 1.0; i < 8.0; i ++) {
        float m = pow(2.0, i);
        n += snoise(st * m) * (1.0 / m);
    }
    return n * 0.5 + 0.5;
}