#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
float u_p_pattern_height = 50.;
float u_p_band_height = 25.;

int pattern_n = int(ceil(u_resolution.y / u_p_pattern_height));
vec2 pattern = vec2((u_p_pattern_height / u_resolution.y) * u_resolution.x, u_p_pattern_height);
vec2 band = vec2((u_p_band_height / u_resolution.y) * u_resolution.x, u_p_band_height);
vec2 gap = vec2(((u_p_pattern_height - u_p_band_height) / u_resolution.y * u_resolution.x), (u_p_pattern_height - u_p_band_height));

vec2 pattern_st = pattern / u_resolution;
vec2 band_st = band / u_resolution;
vec2 gap_st = gap / u_resolution;

// for polar coords
vec2 pattern_pos = .5 - pattern_st;
vec2 band_pos = .5 - band_st;
vec2 gap_pos = .5 - gap_st;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
	vec2 pos = vec2(0.5) - st; //distance from center?
	float r = length(pos)*2.0;
    float a = atan(pos.y,pos.x);

    // vec2 pos = vec2(0.5)-st;


    // f = abs(cos(a*3.));
    // f = abs(cos(a*2.5))*.5+.3;
    // f = abs(cos(a*12.)*sin(a*3.))*.8+.1;
    // f = smoothstep(-.5,1., cos(a*10.))*0.2+0.5;

    // color = vec3( 1.-smoothstep(f,f+0.02,r) );

    // gl_FragColor = vec4(color, 1.0);

    // if (r<.125 * f)
    //     gl_FragColor = vec4(0,0,0,1); // red
    // else if (r < 1.* f)
    //     gl_FragColor = vec4(1,0,1,1); // black
	// else
	// 	gl_FragColor = vec4(0,0,0,1);

	float fx = abs(cos(a*2.));
	float dist = mod((st.y - fx), pattern_st.y);
	vec3 color = vec3(step(dist, band_st.y));
	
	gl_FragColor = vec4(color,1.0);
}
