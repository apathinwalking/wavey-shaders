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

uniform float u_m_motif_height;
uniform float u_m_band_height;

uniform float u_b_tempo;

int motif_n = int(ceil(u_resolution.y / u_m_motif_height));
vec2 motif = vec2((u_m_motif_height / u_resolution.y) * u_resolution.x, u_m_motif_height);
vec2 band = vec2((u_m_band_height / u_resolution.y) * u_resolution.x, u_m_band_height);
vec2 gap = vec2(((u_m_motif_height - u_m_band_height) / u_resolution.y * u_resolution.x), (u_m_motif_height - u_m_band_height));

vec2 motif_st = motif / u_resolution;
vec2 band_st = band / u_resolution;
vec2 gap_st = gap / u_resolution;

float mv() {
	float t = 60.0/u_b_tempo;
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
	float b = 1./period;
	return amp * floor(fract((x * b) + pshift) + .5) + vshift;
}

float sawtooth(float x, float vars[5]) {
	float amp = vars[0];
	float pshift = vars[1];
	float period = vars[2];
	float vshift = vars[3];
	float b = 1./period;
	return amp * fract((x * b) + pshift) + vshift;
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

float alpha(float x) {
	float vars[5];
	vars[0] = u_a_amplitude;  // Amplitude
	vars[1] = u_a_pshift; // phaseShift
	vars[2] = u_a_period; // period
	vars[3] = u_a_vshift; // vshift
	vars[4] = 2.; // other1

	return (
		(u_a_sine * sine(x, vars)) +
		(u_a_square * square(x, vars)) +
		(u_a_sawtooth * sawtooth(x, vars)) +
		(u_a_triangle * triangle(x, vars)) +
		(u_a_pulse * pulse(x, vars)) +
		(u_a_noise * noise(x, vars)) +
		(u_a_dampedSine * dampedSine(x, vars)) +
		(u_a_sineIn * sineIn(x, vars)) +
		(u_a_sineOut * sineOut(x, vars)) +
		(u_a_sineInOut * sineInOut(x, vars)) +
		(u_a_polyIn * polyIn(x, vars)) +
		(u_a_polyOut * polyOut(x, vars)) +
		(u_a_polyInOut * polyInOut(x, vars))
	);
}

float omega(float x) {
	float vars[5];
	vars[0] = u_o_amplitude; // Amplitude
	vars[1] = u_o_pshift; // phaseShift
	vars[2] = u_o_period; // period
	vars[3] = u_o_vshift; // vshift
	vars[4] = 2.; // other1

	return (
		(u_o_sine * sine(x, vars)) +
		(u_o_square * square(x, vars)) +
		(u_o_sawtooth * sawtooth(x, vars)) +
		(u_o_triangle * triangle(x, vars)) +
		(u_o_pulse * pulse(x, vars)) +
		(u_o_noise * noise(x, vars)) +
		(u_o_dampedSine * dampedSine(x, vars)) +
		(u_o_sineIn * sineIn(x, vars)) +
		(u_o_sineOut * sineOut(x, vars)) +
		(u_o_sineInOut * sineInOut(x, vars)) +
		(u_o_polyIn * polyIn(x, vars)) +
		(u_o_polyOut * polyOut(x, vars)) +
		(u_o_polyInOut * polyInOut(x, vars))
	);
}

float delta(vec2 st) {
	float ax = alpha(st.x);
	float ox = omega(st.x);
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