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
uniform float u_time;

uniform float u_a_amplitude;
uniform float u_a_pshift;
uniform float u_a_period;
uniform float u_a_vshift;
uniform float u_a_ratio;
uniform float u_a_decay;
uniform float u_a_exponent;
uniform float u_a_plusx;

uniform float u_a_sine;
uniform float u_a_square;
uniform float u_a_sawtooth;
uniform float u_a_triangle;
uniform float u_a_pulse;
uniform float u_a_noise;
uniform float u_a_dampedSine;
uniform float u_a_sineIn;
uniform float u_a_sineOut;
uniform float u_a_sineInOut;
uniform float u_a_polyIn;
uniform float u_a_polyOut;
uniform float u_a_polyInOut;

uniform float u_o_amplitude;
uniform float u_o_pshift;
uniform float u_o_period;
uniform float u_o_vshift;
uniform float u_o_ratio;
uniform float u_o_decay;
uniform float u_o_exponent;
uniform float u_o_plusx;

uniform float u_o_sine;
uniform float u_o_square;
uniform float u_o_sawtooth;
uniform float u_o_triangle;
uniform float u_o_pulse;
uniform float u_o_noise;
uniform float u_o_dampedSine;
uniform float u_o_sineIn;
uniform float u_o_sineOut;
uniform float u_o_sineInOut;
uniform float u_o_polyIn;
uniform float u_o_polyOut;
uniform float u_o_polyInOut;

uniform float u_p_pattern_height;
uniform float u_p_band_height;

float tempo = 15.;

int pattern_n = int(ceil(u_resolution.y / u_p_pattern_height));
vec2 pattern = vec2((u_p_pattern_height / u_resolution.y) * u_resolution.x, u_p_pattern_height);
vec2 band = vec2((u_p_band_height / u_resolution.y) * u_resolution.x, u_p_band_height);
vec2 gap = vec2(((u_p_pattern_height - u_p_band_height) / u_resolution.y * u_resolution.x), (u_p_pattern_height - u_p_band_height));

vec2 pattern_st = pattern / u_resolution;
vec2 band_st = band / u_resolution;
vec2 gap_st = gap / u_resolution;

float mv() {
  float t = 60.0/tempo;
  return u_time / t;
}

float rand(float x) {
   return fract(sin(x)*100000.0);
}

float sine(float x, float vars[9]) {
  float amp = vars[0];
  float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float b = M_2PI / period;
	float c = pshift * M_2PI;
	return amp * sin((x * b) + c) + vshift;
}

float square(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float b = 1./period;
	return amp * floor(fract((x * b) + pshift) + .5) + vshift;
}

float sawtooth(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float b = 1./period;
	return amp * fract((x * b) + pshift) + vshift;
}

float triangle(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float b = 1./period;
	return amp * abs(2.0 * fract((x * b) + pshift) - 1.0) + vshift;
}

float pulse(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float ratio = vars[4]; // 0 to 1 start at .25
	float b = 1./period;
	return amp * floor(fract((x * b) + pshift) - ratio) + vshift;

}

float noise(float x, float vars[9]) {
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

float dampedSine(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float decay = vars[5];
	period = M_2PI / period;
	pshift = pshift * M_2PI;

	return ((amp * pow(M_E, -1.0 * decay * x)) * (cos((period * x) + pshift))) + vshift;
}

float sineIn(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	period = M_HPI / period;
	pshift = pshift * M_HPI;
	return 1. - (amp * cos(mod((x * period) + pshift, M_HPI)) + vshift);
}

float sineOut(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	period = M_HPI / period;
	pshift = pshift * M_HPI;

	return amp * sin(mod((x * period) + pshift, M_HPI)) + vshift;
}

float sineInOut(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	period = M_PI / period;
	pshift = pshift * M_PI;
	return (1. - (amp * cos(mod((x * period) + pshift, M_PI)) + vshift))/2.;
}

float polyIn(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float exponent = vars[6];
	float b = 1./period;
	float inner = fract(x*b + pshift);

	return amp * clamp(pow(inner,exponent),0.,1.) + vshift;
}

float polyOut(float x, float vars[9]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float exponent = vars[6];
	float b = 1./period;
	float inner = fract(x*b + pshift);

	return amp * clamp((1. - pow(1.- inner,exponent)),0.,1.) + vshift + amp;
}

float polyInOut(float x, float vars[9]) {
	float period = vars[2];
	return (mod(x,period) <= period/2.) ? polyIn(x*2., vars) : polyOut(x*2., vars);
} 

float alpha(float x) {
	float o = 0.;
	float vars[9];
	vars[0] = u_a_amplitude;
	vars[1] = u_a_pshift;
	vars[2] = u_a_period;
	vars[3] = u_a_vshift;
	vars[4] = u_a_ratio;
	vars[5] = u_a_decay;
	vars[6] = u_a_exponent;
	vars[7] = u_a_plusx;
	vars[8] = 0.;

	o += sine(x, vars) * u_a_sine;
	o += square(x, vars) * u_a_square;
	o += sawtooth(x, vars) * u_a_sawtooth;
	o += triangle(x, vars) * u_a_triangle;
	o += pulse(x, vars) * u_a_pulse;
	o += noise(x, vars) * u_a_noise;
	o += dampedSine(x, vars) * u_a_dampedSine;
	o += sineIn(x, vars) * u_a_sineIn;
	o += sineOut(x, vars) * u_a_sineOut;
	o += sineInOut(x, vars) * u_a_sineInOut;
	o += polyIn(x, vars) * u_a_polyIn;
	o += polyOut(x, vars) * u_a_polyOut;
	o += polyInOut(x, vars) * u_a_polyInOut;

	o += u_a_plusx * x;

	return o;
}

float omega(float x) {
	float o = 0.;
	float vars[9];
	vars[0] = u_o_amplitude;
	vars[1] = u_o_pshift;
	vars[2] = u_o_period;
	vars[3] = u_o_vshift;
	vars[4] = u_o_ratio;
	vars[5] = u_o_decay;
	vars[6] = u_a_exponent;
	vars[7] = u_o_plusx;
	vars[8] = 0.;

	o += sine(x, vars) * u_o_sine;
	o += square(x, vars) * u_o_square;
	o += sawtooth(x, vars) * u_o_sawtooth;
	o += triangle(x, vars) * u_o_triangle;
	o += pulse(x, vars) * u_o_pulse;
	o += noise(x, vars) * u_o_noise;
	o += dampedSine(x, vars) * u_o_dampedSine;
	o += sineIn(x, vars) * u_o_sineIn;
	o += sineOut(x, vars) * u_o_sineOut;
	o += sineInOut(x, vars) * u_o_sineInOut;
	o += polyIn(x, vars) * u_o_polyIn;
	o += polyOut(x, vars) * u_o_polyOut;
	o += polyInOut(x, vars) * u_o_polyInOut;

	o += u_o_plusx * x;

	return o;
}


float delta(vec2 st) {
	float ax = alpha(st.x);
	float ox = omega(st.x);
	float factor = st.y;
	return ax + ((ox - ax) * factor);
}

float eval(vec2 st) {
	float fx = delta(st);
	float dist = mod((st.y - fx), pattern_st.y);
	return step(dist,band_st.y);
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
	st.x *= u_resolution.x/u_resolution.y;
	// st *= 2.0 - 1.0;

	vec3 color = vec3(eval(st));

	gl_FragColor = vec4(color,1.0);
}