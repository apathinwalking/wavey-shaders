var opt = {
	canvas: {
		width: {val: 1080, min: 100, max: 2000, name: "Width"},
		height:{val: 720, min: 100, max: 2000, name: "Height"},
	},
	alpha: {
		amplitude: {val: .25, min:-4, max:4, name: "Amplitude"},
		pshift: {val: 0.0, min: -4, max: 4, name: "Phase Shift"},
		period: {val: .25, min: 0.001, max: 4, name: "Period"},
		vshift: {val: .5, min: -4, max: 4, name: "Vertical Shift"},
	
		sine: {val: 0, min: 0, max: 1, name: "Sine Wave"},
		square: {val: 0, min: 0, max: 1, name: "Square Wave"},
		sawtooth: {val: 0, min: 0, max: 1, name: "Sawtooth Wave"},
		triangle: {val: 1, min: 0, max: 1, name: "Triangle Wave"},
		pulse: {val: 0, min: 0, max: 1, name: "Pulse Wave"},
		noise: {val: 0, min: 0, max: 1, name: "Noise Wave"},
		dampedSine: {val: 0, min: 0, max: 1, name: "Damped Sine Wave"},
		sineIn: {val: 0, min: 0, max: 1, name: "Sine-In Wave"},
		sineOut: {val: 0, min: 0, max: 1, name: "Sine-Out Wave"},
		sineInOut: {val: 0, min: 0, max: 1, name: "Sine-In-Out Wave"},
		polyIn: {val: 0, min: 0, max: 1, name: "Poly-In Wave"},
		polyOut: {val: 0, min: 0, max: 1, name: "Poly-Out Wave"},
		polyInOut: {val: 0, min: 0, max: 1, name: "Poly-In-Out Wave"}
	},
	omega: {
		amplitude: {val: .25, min:-4, max:4, name: "Amplitude"},
		pshift: {val: 0.0, min: -4, max: 4, name: "Phase Shift"},
		period: {val: .25, min: 0.001, max: 4, name: "Period"},
		vshift: {val: .5, min: -4, max: 4, name: "Vertical Shift"},

		sine: {val: 1, min: 0, max: 1, name: "Sine Wave"},
		square: {val: 0, min: 0, max: 1, name: "Square Wave"},
		sawtooth: {val: 0, min: 0, max: 1, name: "Sawtooth Wave"},
		triangle: {val: 0, min: 0, max: 1, name: "Triangle Wave"},
		pulse: {val: 0, min: 0, max: 1, name: "Pulse Wave"},
		noise: {val: 0, min: 0, max: 1, name: "Noise Wave"},
		dampedSine: {val: 0, min: 0, max: 1, name: "Damped Sine Wave"},
		sineIn: {val: 0, min: 0, max: 1, name: "Sine-In Wave"},
		sineOut: {val: 0, min: 0, max: 1, name: "Sine-Out Wave"},
		sineInOut: {val: 0, min: 0, max: 1, name: "Sine-In-Out Wave"},
		polyIn: {val: 0, min: 0, max: 1, name: "Poly-In Wave"},
		polyOut: {val: 0, min: 0, max: 1, name: "Poly-Out Wave"},
		polyInOut: {val: 0, min: 0, max: 1, name: "Poly-In-Out Wave"}
	},

	motif: {
		motifHeight: {val: 50, min: 0, max: 400, name: "Motif Height"},
		bandHeight: {val: 25, min: 0, max: 400, name: "Band Height"}
	}
};

var container;
var camera, scene, renderer;
var uniforms, material, mesh;
var gui, alphaF, omegaF, canvasF, motifF, beatF;

var startTime = Date.now();

init();
animate();

function init() {
	initUniforms();
	initThree();
	initGUI();
}

function initUniforms() {
	uniforms = {
		u_time: { type: "f", value: 1.0 },
		u_resolution: { type: "v2", value: new THREE.Vector2(opt.canvas.width.val, opt.canvas.height.val) },
		
		u_a_amplitude: { type: "f", value: opt.alpha.amplitude.val },
		u_a_pshift: { type: "f", value: opt.alpha.pshift.val },
		u_a_period: { type: "f", value: opt.alpha.period.val },
		u_a_vshift: { type: "f", value: opt.alpha.vshift.val },

		u_a_sine: { type: "f", value: opt.alpha.sine.val },
		u_a_square: { type: "f", value: opt.alpha.square.val },
		u_a_sawtooth: { type: "f", value: opt.alpha.sawtooth.val },
		u_a_triangle: { type: "f", value: opt.alpha.triangle.val },
		u_a_pulse: { type: "f", value: opt.alpha.pulse.val },
		u_a_noise: { type: "f", value: opt.alpha.noise.val },
		u_a_dampedSine: { type: "f", value: opt.alpha.dampedSine.val },
		u_a_sineIn: { type: "f", value: opt.alpha.sineIn.val },
		u_a_sineOut: { type: "f", value: opt.alpha.sineOut.val },
		u_a_sineInOut: { type: "f", value: opt.alpha.sineInOut.val },
		u_a_polyIn: { type: "f", value: opt.alpha.polyIn.val },
		u_a_polyOut: { type: "f", value: opt.alpha.polyOut.val },
		u_a_polyInOut: { type: "f", value: opt.alpha.polyInOut.val },

		u_o_amplitude: { type: "f", value: opt.omega.amplitude.val },
		u_o_pshift: { type: "f", value: opt.omega.pshift.val },
		u_o_period: { type: "f", value: opt.omega.period.val },
		u_o_vshift: { type: "f", value: opt.omega.vshift.val },

		u_o_sine: { type: "f", value: opt.omega.sine.val },
		u_o_square: { type: "f", value: opt.omega.square.val },
		u_o_sawtooth: { type: "f", value: opt.omega.sawtooth.val },
		u_o_triangle: { type: "f", value: opt.omega.triangle.val },
		u_o_pulse: { type: "f", value: opt.omega.pulse.val },
		u_o_noise: { type: "f", value: opt.omega.noise.val },
		u_o_dampedSine: { type: "f", value: opt.omega.dampedSine.val },
		u_o_sineIn: { type: "f", value: opt.omega.sineIn.val },
		u_o_sineOut: { type: "f", value: opt.omega.sineOut.val },
		u_o_sineInOut: { type: "f", value: opt.omega.sineInOut.val },
		u_o_polyIn: { type: "f", value: opt.omega.polyIn.val },
		u_o_polyOut: { type: "f", value: opt.omega.polyOut.val },
		u_o_polyInOut: { type: "f", value: opt.omega.polyInOut.val },

		u_m_motif_height: {type: "f", value: opt.motif.motifHeight.val},
		u_m_band_height: {type: "f", value: opt.motif.bandHeight.val}
	};
}

function initThree() {
	container = document.getElementById('container');
	camera = new THREE.Camera();
	camera.position.z = 1;
	scene = new THREE.Scene();

	material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent
	});

	mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
	container.appendChild(renderer.domElement);
	renderer.setSize(opt.canvas.width.val, opt.canvas.height.val);
}


function initGUI() {
	gui = new dat.GUI();
	alphaF = gui.addFolder("Alpha-Wave");
	omegaF = gui.addFolder("Omega-Wave");
	motifF = gui.addFolder("Motif");

	alphaF.open();
	omegaF.open();
	motifF.open();
	
	alphaF.add(uniforms.u_a_amplitude, "value").min(opt.alpha.amplitude.min).max(opt.alpha.amplitude.max).name(opt.alpha.amplitude.name);
	alphaF.add(uniforms.u_a_pshift, "value").min(opt.alpha.pshift.min).max(opt.alpha.pshift.max).name(opt.alpha.pshift.name);
	alphaF.add(uniforms.u_a_period, "value").min(opt.alpha.period.min).max(opt.alpha.period.max).name(opt.alpha.period.name);
	alphaF.add(uniforms.u_a_vshift, "value").min(opt.alpha.vshift.min).max(opt.alpha.vshift.max).name(opt.alpha.vshift.name);
	alphaF.add(uniforms.u_a_sine, "value").min(opt.alpha.sine.min).max(opt.alpha.sine.max).name(opt.alpha.sine.name);
	alphaF.add(uniforms.u_a_square, "value").min(opt.alpha.square.min).max(opt.alpha.square.max).name(opt.alpha.square.name);
	alphaF.add(uniforms.u_a_sawtooth, "value").min(opt.alpha.sawtooth.min).max(opt.alpha.sawtooth.max).name(opt.alpha.sawtooth.name);
	alphaF.add(uniforms.u_a_triangle, "value").min(opt.alpha.triangle.min).max(opt.alpha.triangle.max).name(opt.alpha.triangle.name);
	alphaF.add(uniforms.u_a_pulse, "value").min(opt.alpha.pulse.min).max(opt.alpha.pulse.max).name(opt.alpha.pulse.name);
	alphaF.add(uniforms.u_a_noise, "value").min(opt.alpha.noise.min).max(opt.alpha.noise.max).name(opt.alpha.noise.name);
	alphaF.add(uniforms.u_a_dampedSine, "value").min(opt.alpha.dampedSine.min).max(opt.alpha.dampedSine.max).name(opt.alpha.dampedSine.name);
	alphaF.add(uniforms.u_a_sineIn, "value").min(opt.alpha.sineIn.min).max(opt.alpha.sineIn.max).name(opt.alpha.sineIn.name);
	alphaF.add(uniforms.u_a_sineOut, "value").min(opt.alpha.sineOut.min).max(opt.alpha.sineOut.max).name(opt.alpha.sineOut.name);
	alphaF.add(uniforms.u_a_sineInOut, "value").min(opt.alpha.sineInOut.min).max(opt.alpha.sineInOut.max).name(opt.alpha.sineInOut.name);
	alphaF.add(uniforms.u_a_polyIn, "value").min(opt.alpha.polyIn.min).max(opt.alpha.polyIn.max).name(opt.alpha.polyIn.name);
	alphaF.add(uniforms.u_a_polyOut, "value").min(opt.alpha.polyOut.min).max(opt.alpha.polyOut.max).name(opt.alpha.polyOut.name);
	alphaF.add(uniforms.u_a_polyInOut, "value").min(opt.alpha.polyInOut.min).max(opt.alpha.polyInOut.max).name(opt.alpha.polyInOut.name);

	omegaF.add(uniforms.u_o_amplitude, "value").min(opt.omega.amplitude.min).max(opt.omega.amplitude.max).name(opt.omega.amplitude.name);
	omegaF.add(uniforms.u_o_pshift, "value").min(opt.omega.pshift.min).max(opt.omega.pshift.max).name(opt.omega.pshift.name);
	omegaF.add(uniforms.u_o_period, "value").min(opt.omega.period.min).max(opt.omega.period.max).name(opt.omega.period.name);
	omegaF.add(uniforms.u_o_vshift, "value").min(opt.omega.vshift.min).max(opt.omega.vshift.max).name(opt.omega.vshift.name);
	omegaF.add(uniforms.u_o_sine, "value").min(opt.omega.sine.min).max(opt.omega.sine.max).name(opt.omega.sine.name);
	omegaF.add(uniforms.u_o_square, "value").min(opt.omega.square.min).max(opt.omega.square.max).name(opt.omega.square.name);
	omegaF.add(uniforms.u_o_sawtooth, "value").min(opt.omega.sawtooth.min).max(opt.omega.sawtooth.max).name(opt.omega.sawtooth.name);
	omegaF.add(uniforms.u_o_triangle, "value").min(opt.omega.triangle.min).max(opt.omega.triangle.max).name(opt.omega.triangle.name);
	omegaF.add(uniforms.u_o_pulse, "value").min(opt.omega.pulse.min).max(opt.omega.pulse.max).name(opt.omega.pulse.name);
	omegaF.add(uniforms.u_o_noise, "value").min(opt.omega.noise.min).max(opt.omega.noise.max).name(opt.omega.noise.name);
	omegaF.add(uniforms.u_o_dampedSine, "value").min(opt.omega.dampedSine.min).max(opt.omega.dampedSine.max).name(opt.omega.dampedSine.name);
	omegaF.add(uniforms.u_o_sineIn, "value").min(opt.omega.sineIn.min).max(opt.omega.sineIn.max).name(opt.omega.sineIn.name);
	omegaF.add(uniforms.u_o_sineOut, "value").min(opt.omega.sineOut.min).max(opt.omega.sineOut.max).name(opt.omega.sineOut.name);
	omegaF.add(uniforms.u_o_sineInOut, "value").min(opt.omega.sineInOut.min).max(opt.omega.sineInOut.max).name(opt.omega.sineInOut.name);
	omegaF.add(uniforms.u_o_polyIn, "value").min(opt.omega.polyIn.min).max(opt.omega.polyIn.max).name(opt.omega.polyIn.name);
	omegaF.add(uniforms.u_o_polyOut, "value").min(opt.omega.polyOut.min).max(opt.omega.polyOut.max).name(opt.omega.polyOut.name);
	omegaF.add(uniforms.u_o_polyInOut, "value").min(opt.omega.polyInOut.min).max(opt.omega.polyInOut.max).name(opt.omega.polyInOut.name);

	motifF.add(uniforms.u_m_motif_height, "value").min(opt.motif.motifHeight.min).max(opt.motif.motifHeight.max).name(opt.motif.motifHeight.name);
	motifF.add(uniforms.u_m_band_height, "value").min(opt.motif.bandHeight.min).max(opt.motif.bandHeight.max).name(opt.motif.bandHeight.name);

}


function animate() {
	requestAnimationFrame(animate);
	update();
	render();
}

function update() {
	var elapsedMilliseconds = Date.now() - startTime;
	var elapsedSeconds = elapsedMilliseconds / 1000.;
	uniforms.u_time.value = elapsedSeconds;
}

function render() {
	renderer.render(scene, camera);
}