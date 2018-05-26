// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

#define M_PI 3.1415926535897932384626433832795
#define M_2PI M_PI * 2.
#define M_HPI M_PI / 2.
#define M_E exp(1.)

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float motif_y = 200.0;
float band_y = 100.;

int motif_n = int(ceil(u_resolution.y / motif_y));
vec2 motif = vec2((motif_y / u_resolution.y) * u_resolution.x, motif_y);
vec2 band = vec2((band_y / u_resolution.y) * u_resolution.x, band_y);
vec2 gap = vec2(((motif_y - band_y) / u_resolution.y * u_resolution.x), (motif_y - band_y));

vec2 motif_st = motif / u_resolution;
vec2 band_st = band / u_resolution;
vec2 gap_st = gap / u_resolution;

float bpm() {
    float beats = 60.;
    float t = 60.0/beats;
    return u_time / t;
}


float rand(float x) {
   return fract(sin(x)*100000.0);
}

float sine(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    float b = M_2PI / period;
    float c = pshift * M_2PI;
    return amp * sin((x * b) + c) + vshift;
}

float square(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    return amp * floor(fract((x * period) + pshift) + .5) + vshift;
}

float sawtooth(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    return amp * fract((x * period) + pshift) + vshift;
}

float triangle(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    float b = 1./period;
	return amp * abs(2.0 * fract((x * b) + pshift) - 1.0) + vshift;
}

float pulse(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    float ratio = vars[4]; // 0 to 1 start at .25
	return amp * floor(fract((x * period) + pshift) - ratio) + vshift;

}

float noise(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    period = M_2PI / period;
    pshift = pshift * M_2PI;
    float i = floor((x * period) + pshift);
	float f = fract((x * period) + pshift);
    return amp * mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f)) + vshift;
}

float dampedSine(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    float decay = vars[4];
    period = M_2PI / period;
    pshift = pshift * M_2PI;

    return ((amp * pow(M_E, -1.0 * decay * x)) * (cos((period * x) + pshift))) + vshift;
}

float sineIn(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    period = M_HPI / period;
    pshift = pshift * M_HPI;
    return 1. - (amp * cos(mod((x * period) + pshift, M_HPI)) + vshift);
}

float sineOut(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    period = M_HPI / period;
    pshift = pshift * M_HPI;

    return amp * sin(mod((x * period) + pshift, M_HPI)) + vshift;
}

float sineInOut(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    period = M_PI / period;
    pshift = pshift * M_PI;
    return (1. - (amp * cos(mod((x * period) + pshift, M_PI)) + vshift))/2.;
}

float polyIn(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    float exponent = vars[4];
    float b = 1./period;
    float inner = fract(x*b + pshift);

    return amp * clamp(pow(inner,exponent),0.,1.) + vshift;
}

float polyOut(float x, float vars[5]) {
    float amp = vars[0];
    float pshift = vars[1];
    float period = vars[2];
    float vshift = vars[3];
    float exponent = vars[4];
    float b = 1./period;
    float inner = fract(x*b + pshift);

    return amp * clamp((1. - pow(1.- inner,exponent)),0.,1.) + vshift + amp;
}

float polyInOut(float x, float vars[5]) {
    float period = vars[2];
    return (mod(x,period) <= period/2.) ? polyIn(x*2., vars) : polyOut(x*2., vars);
}

float alpha(float x, float vars[5]) {
    return polyIn(x, vars);
}

float omega(float x, float vars[5]) {
    return sine(x, vars);
}

float delta(vec2 st) {
    float a_vars[5];
    a_vars[0] = 1.0;  // Amplitude
    a_vars[1] = 0.0 + bpm(); // phaseShift
    a_vars[2] = .5; // period
    a_vars[3] = 0.5; // vshift
    a_vars[4] = 2.; // other1

    float o_vars[5];
    o_vars[0] = 1.0  * polyIn(bpm(), a_vars); // Amplitude
    o_vars[1] = 0.0 - bpm(); // phaseShift
    o_vars[2] = .5; // period
    o_vars[3] = 0.5; // vshift
    o_vars[4] = 2.; // other1

    float ax = alpha(st.x, a_vars);
    float ox = omega(st.x, o_vars);
    float factor = st.y;
    return ax + ((ox - ax) * factor);
}

float eval(vec2 st) {
    float fx = delta(st);
    float dist = mod((st.y - fx), motif_st.y);
    return step(dist,band_st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    // st *= 2.0 - 1.0;

    vec3 color = vec3(eval(st));

    gl_FragColor = vec4(color,1.0);
}
