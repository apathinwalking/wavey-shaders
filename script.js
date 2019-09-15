var opts = {
	canvas: {
		width: {val: 540, min: 128, max: 2048, step: 4, name: "Width"},
		height:{val: 540, min: 128, max: 2048, step: 4, name: "Height"},
	},
	alpha: {
		amplitude: {val: .25, min:-10, max:8, step: .1, name: "Amplitude"},
		pshift: {val: 0.0, min: -10, max: 8, step: .1, name: "Phase Shift"},
		period: {val: .25, min: 0.001, max: 8, step: .001, name: "Period"},
		vshift: {val: .5, min: -8, max: 8, step: .1, name: "Vertical Shift"},
		ratio: {val: .5, min: 0, max: 1, step: .05, name: "Pulse Ratio"},
		decay: {val: 4, min: 0, max: 10, step: .1, name: "Damp Decay"},
		exponent: {val: 3, min: 0, max:6, step: .1, name: "Exponent"},
		plusx: {val: 0, min: -8, max: 8, step: .1, name: "Plus X"},

		type: {val: "sine", name: "Wave Type"}
	},
	omega: {
		amplitude: {val: .25, min:-10, max:8, step: .1, name: "Amplitude"},
		pshift: {val: 0.0, min: -10, max: 8, step: .1, name: "Phase Shift"},
		period: {val: .25, min: 0.001, max: 8, step: .001, name: "Period"},
		vshift: {val: .5, min: -8, max: 8, step: .1, name: "Vertical Shift"},
		ratio: {val: .5, min: 0, max: 1, step: .05, name: "Pulse Ratio"},
		decay: {val: 4, min: 0, max: 10, step: .1, name: "Damp Decay"},
		exponent: {val: 3, min: 0, max:6, step: .1, name: "Exponent"},
		plusx: {val: 0, min: -8, max: 8, step: .1, name: "Plus X"},

		type: {val: "sine", name: "Wave Type"}
	},
	pattern: {
		coordType: {val: "cartesian", name: "Coordinate System"},
		patternHeight: {val: 50, min: 0, max: 400, step: 1, name: "pattern Height"},
		bandHeight: {val: 25, min: 0, max: 400, step: 1, name: "Band Height"},
		radialSymmetry: {val: 1, min: -10, max: 10, step: .1, name: "Radial Symmetry"},
		smoothstep: {val: 0, min: 0, max: .1, step: .001, name: "Smoothstep"}
	},
	renderer: {
		antialias: true
	}
};

var waveTypes =  [
	"sine",
	"square",
	"sawtooth",
	"triangle",
	"pulse",
	"noise",
	"dampedSine",
	"sineIn",
	"sineOut",
	"sineInOut",
	"polyIn",
	"polyOut",
	"polyInOut",
];

var coordTypes = [
	"cartesian",
	"polar"
];

var fragmentShader, vertexShader;
var container;
var camera, scene, renderer;
var uniforms, material, mesh;
var gui, alphaF, omegaF, canvasF, patternF, beatF;

var startTime = Date.now();

run();

function run() {
	loadFragment().then(text => {
		fragmentShader = text;
		return loadVertex();
	}).then(text => {
		vertexShader = text;
		
		initUniforms();
		initThree();
		initGUI();
		
		animate();
	});
}

function loadFragment() {
	var shaderLoc;
	var re = /file:/
	var href = location.href;
	var isLocal = re.test(href);
	if (isLocal) {
		shaderLoc = 'shaders/shader.frag';
	} else {
		shaderLoc = 'https://raw.githubusercontent.com/evanlorim/wavy-shaders/master/shaders/shader.frag'
	}

	return new Promise(resolve => {
		let request = new XMLHttpRequest();
		request.open('GET', shaderLoc, true);
		request.addEventListener('load', () => {
			resolve(request.responseText);
		});
		request.send();
	});
}

function loadVertex() {
	var shaderLoc;
	var re = /file:/
	var href = location.href;
	var isLocal = re.test(href);
	if (isLocal) {
		shaderLoc = 'shaders/vertex.vertex';
	} else {
		shaderLoc = 'https://raw.githubusercontent.com/evanlorim/wavy-shaders/master/shaders/vertex.vertex'
	}

	return new Promise(resolve => {
		var request = new XMLHttpRequest();
		request.open('GET', shaderLoc, true);
		request.addEventListener('load', () => {
			resolve(request.responseText);
		});
		request.send();
	});
}

function initUniforms() {
	uniforms = {
		u_time: { type: "f", value: 1.0 },
		u_resolution: { type: "v2", value: new THREE.Vector2(opts.canvas.width.val, opts.canvas.height.val) },
		
		u_a_amplitude: { type: "f", value: opts.alpha.amplitude.val },
		u_a_pshift: { type: "f", value: opts.alpha.pshift.val },
		u_a_period: { type: "f", value: opts.alpha.period.val },
		u_a_vshift: { type: "f", value: opts.alpha.vshift.val },
		u_a_ratio: {type: "f", value: opts.alpha.ratio.val},
		u_a_decay: {type: "f", value: opts.alpha.decay.val},
		u_a_exponent: {type: "f", value: opts.alpha.exponent.val},
		u_a_plusx: {type:"f", value: opts.alpha.plusx.val},

		u_o_amplitude: { type: "f", value: opts.omega.amplitude.val },
		u_o_pshift: { type: "f", value: opts.omega.pshift.val },
		u_o_period: { type: "f", value: opts.omega.period.val },
		u_o_vshift: { type: "f", value: opts.omega.vshift.val },
		u_o_ratio: {type: "f", value: opts.omega.ratio.val},
		u_o_decay: {type: "f", value: opts.omega.decay.val},
		u_o_exponent: {type: "f", value: opts.omega.exponent.val},
		u_o_plusx: {type:"f", value: opts.omega.plusx.val},

		u_p_pattern_height: {type: "f", value: opts.pattern.patternHeight.val},
		u_p_band_height: {type: "f", value: opts.pattern.bandHeight.val},
		u_p_radial_sym: {type: "f", value: opts.pattern.radialSymmetry.val},
		u_p_smoothstep: {type: "f", value: opts.pattern.smoothstep.val}
	};

	waveTypes.forEach(w => {
		var aVal = opts.alpha.type.val == w ? 1 : 0;
		var oVal = opts.omega.type.val == w ? 1 : 0;

		var uaname = "u_a_" + w;
		var uoname = "u_o_" + w;

		uniforms[uaname] = {type: "f", value: aVal};
		uniforms[uoname] = {type: "f", value: oVal};
	});

	coordTypes.forEach(w => {
		var val = opts.pattern.coordType.val == w ? 1: 0;
		var name = "u_p_" + w;
		uniforms[name] = {type: "f", value: val};
	});
}

function initThree() {
	container = document.getElementById('container');
	camera = new THREE.Camera();
	camera.position.z = 1;
	scene = new THREE.Scene();

	material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	});

	mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer(opts.renderer);
	renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
	container.appendChild(renderer.domElement);
	renderer.setSize(opts.canvas.width.val, opts.canvas.height.val);
}


function initGUI() {
	gui = new dat.GUI();
	alphaF = gui.addFolder("Alpha-Wave");
	omegaF = gui.addFolder("Omega-Wave");
	patternF = gui.addFolder("Pattern");
	canvasF = gui.addFolder("Canvas");

	var vars = {
		alphaType: opts.alpha.type.val,
		omegaType: opts.alpha.type.val,
		coordType: opts.pattern.coordType.val
	};

	alphaF.open();
	omegaF.open();
	
	alphaF.add(uniforms.u_a_amplitude, "value").min(opts.alpha.amplitude.min).max(opts.alpha.amplitude.max).step(opts.alpha.amplitude.step).name(opts.alpha.amplitude.name);
	alphaF.add(uniforms.u_a_pshift, "value").min(opts.alpha.pshift.min).max(opts.alpha.pshift.max).step(opts.alpha.pshift.step).name(opts.alpha.pshift.name);
	alphaF.add(uniforms.u_a_period, "value").min(opts.alpha.period.min).max(opts.alpha.period.max).step(opts.alpha.period.step).name(opts.alpha.period.name);
	alphaF.add(uniforms.u_a_vshift, "value").min(opts.alpha.vshift.min).max(opts.alpha.vshift.max).step(opts.alpha.vshift.step).name(opts.alpha.vshift.name);
	alphaF.add(uniforms.u_a_ratio, "value").min(opts.alpha.ratio.min).max(opts.alpha.ratio.max).step(opts.alpha.ratio.step).name(opts.alpha.ratio.name);
	alphaF.add(uniforms.u_a_decay, "value").min(opts.alpha.decay.min).max(opts.alpha.decay.max).step(opts.alpha.decay.step).name(opts.alpha.decay.name);
	alphaF.add(uniforms.u_a_exponent, "value").min(opts.alpha.exponent.min).max(opts.alpha.exponent.max).step(opts.alpha.exponent.step).name(opts.alpha.exponent.name);
	alphaF.add(uniforms.u_a_plusx, "value").min(opts.alpha.plusx.min).max(opts.alpha.plusx.max).step(opts.alpha.plusx.step).name(opts.alpha.plusx.name);
	alphaF.add(vars, "alphaType", waveTypes).name(opts.alpha.type.name).onChange(val => {
		waveTypes.forEach(w => {
			var aVal = (val === w) ? 1 : 0;
			var uaname = "u_a_" + w;
			uniforms[uaname].value = aVal;
		});
	});

	omegaF.add(uniforms.u_o_amplitude, "value").min(opts.omega.amplitude.min).max(opts.omega.amplitude.max).step(opts.omega.amplitude.step).name(opts.omega.amplitude.name);
	omegaF.add(uniforms.u_o_pshift, "value").min(opts.omega.pshift.min).max(opts.omega.pshift.max).step(opts.omega.pshift.step).name(opts.omega.pshift.name);
	omegaF.add(uniforms.u_o_period, "value").min(opts.omega.period.min).max(opts.omega.period.max).step(opts.omega.period.step).name(opts.omega.period.name);
	omegaF.add(uniforms.u_o_vshift, "value").min(opts.omega.vshift.min).max(opts.omega.vshift.max).step(opts.omega.vshift.step).name(opts.omega.vshift.name);
	omegaF.add(uniforms.u_o_ratio, "value").min(opts.omega.ratio.min).max(opts.omega.ratio.max).step(opts.omega.ratio.step).name(opts.omega.ratio.name);
	omegaF.add(uniforms.u_o_decay, "value").min(opts.omega.decay.min).max(opts.omega.decay.max).step(opts.omega.decay.step).name(opts.omega.decay.name);
	omegaF.add(uniforms.u_o_exponent, "value").min(opts.omega.exponent.min).max(opts.omega.exponent.max).step(opts.omega.exponent.step).name(opts.omega.exponent.name);
	omegaF.add(uniforms.u_o_plusx, "value").min(opts.omega.plusx.min).max(opts.omega.plusx.max).step(opts.omega.plusx.step).name(opts.omega.plusx.name);
	omegaF.add(vars, "omegaType", waveTypes).name(opts.omega.type.name).onChange(val => {
		waveTypes.forEach(w => {
			var oVal = (val === w) ? 1 : 0;
			var uoname = "u_o_" + w;
			uniforms[uoname].value = oVal;		
		});
	});

	patternF.add(vars, "coordType", coordTypes).name(opts.pattern.coordType.name).onChange(val => {
		coordTypes.forEach(w => {
			var v = (val === w) ? 1 : 0;
			var name = "u_p_" + w;
			uniforms[name].value = v;
		});
	});
	patternF.add(uniforms.u_p_pattern_height, "value").min(opts.pattern.patternHeight.min).max(opts.pattern.patternHeight.max).step(opts.pattern.patternHeight.step).name(opts.pattern.patternHeight.name);
	patternF.add(uniforms.u_p_band_height, "value").min(opts.pattern.bandHeight.min).max(opts.pattern.bandHeight.max).step(opts.pattern.bandHeight.step).name(opts.pattern.bandHeight.name);
	patternF.add(uniforms.u_p_radial_sym, "value").min(opts.pattern.radialSymmetry.min).max(opts.pattern.radialSymmetry.max).step(opts.pattern.radialSymmetry.step).name(opts.pattern.radialSymmetry.name);
	patternF.add(uniforms.u_p_smoothstep, "value").min(opts.pattern.smoothstep.min).max(opts.pattern.smoothstep.max).step(opts.pattern.smoothstep.step).name(opts.pattern.smoothstep.name);


	canvasF.add(uniforms.u_resolution.value, "x").min(opts.canvas.width.min).max(opts.canvas.width.max).name(opts.canvas.width.name).onChange(val => {
		renderer.setSize(val, renderer.getSize().y);
	});
	canvasF.add(uniforms.u_resolution.value, "y").min(opts.canvas.height.min).max(opts.canvas.height.max).name(opts.canvas.height.name).onChange(val => {
		renderer.setSize(renderer.getSize().x, val);
	});
}


function animate() {
	requestAnimationFrame(animate);
	
	var elapsedMilliseconds = Date.now() - startTime;
	var elapsedSeconds = elapsedMilliseconds / 1000.;
	uniforms.u_time.value = elapsedSeconds;

	renderer.render(scene, camera);
}