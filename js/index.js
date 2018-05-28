/* global THREE, dat */

let config = {
	maxW: {name: 'Max Width', val: 540, min: 100, max: 1080, step: 10},
	maxH: {name: 'Max Height', val: 540, min: 100, max: 1080, step: 10},
	bpm: {name: 'Beats/Minute', val: 60, min: 0, max: 300, step: 1},
	motifH: {name: 'Pattern Height', val: 100, min: 0, max: 1080, step: 1},
	bandH: {name: 'Band Height', val: 40, min: 0, max: 1080, step: 1},
	aa: {name: 'Sample Level', val: 0, min: 0, max: 5, step: 1}
};

class WaveyShaders {
	constructor(dat, three, cfg = {}) {
		this.dat = dat;
		this.three = three;
		this.cfg = Object.assign(config, cfg);
		this.loadFragment().then(text => {
			this.fragmentShader = text;
			return this.loadVertex();
		}).then(text => {
			this.vertexShader = text;
			this.initWindow();
			this.initGUI();
			this.animate();
		});
	}

	loadFragment() {
		return new Promise(resolve => {
			let request = new XMLHttpRequest();
			request.open('GET', 'shaders/waves.frag', true);
			request.addEventListener('load', () => {
				resolve(request.responseText);
			});
			request.send();
		});
	}

	loadVertex() {
		return new Promise(resolve => {
			var request = new XMLHttpRequest();
			request.open('GET', 'shaders/vertex.vertex', true);
			request.addEventListener('load', () => {
				resolve(request.responseText);
			});
			request.send();
		});
	}

	initWindow() {
		this.container = document.getElementById('container');

		this.camera = new this.three.Camera();
		this.camera.position.z = 1;

		this.scene = new this.three.Scene();

		this.geometry = new this.three.PlaneBufferGeometry(2, 2);

		this.uniforms = {};
		this.uniforms.u_time = {type: 'f', value: 1.0}; // eslint-disable-line
		this.uniforms.u_resolution = {type: 'v2', value: new this.three.Vector2()}; // eslint-disable-line
		this.uniforms.u_mouse = {type: 'v2', value: new this.three.Vector2()}; // eslint-disable-line
		this.uniforms.u_bpm = {type: 'f', value: this.cfg.bpm.val}; // eslint-disable-line
		this.uniforms.u_motif_h = {type: 'f', value: this.cfg.motifH.val}; // eslint-disable-line
		this.uniforms.u_band_h = {type: 'f', value: this.cfg.bandH.val}; // eslint-disable-line

		this.material = new this.three.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader
		});

		this.mesh = new this.three.Mesh(this.geometry, this.material);
		this.scene.add(this.mesh);

		this.renderer = new this.three.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.container.appendChild(this.renderer.domElement);

		this.composer = new this.three.EffectComposer(this.renderer);
		this.ssaaRenderPass = new this.three.SSAARenderPass(this.scene, this.camera);
		this.ssaaRenderPass.unbiased = false;
		this.composer.addPass(this.ssaaRenderPass);
		this.copyPass = new this.three.ShaderPass(this.three.CopyShader);
		this.copyPass.renderToScreen = true;
		this.composer.addPass(this.copyPass);

		this.windowResize();

		window.addEventListener('resize', this.windowResize, false);

		document.onmousemove = e => {
			this.onMouseMove(e);
		};
	}

	initGUI() {
		this.gui = new this.dat.GUI();
		this.ctrl = {};
		this.ctrl.maxH = this.gui.add(this.cfg.maxH, 'val')
			.min(this.cfg.maxH.min)
			.max(this.cfg.maxH.max)
			.step(this.cfg.maxH.step)
			.name(this.cfg.maxH.name)
			.onChange(() => this.windowResize());
		this.ctrl.maxW = this.gui.add(this.cfg.maxW, 'val')
			.min(this.cfg.maxW.min)
			.max(this.cfg.maxW.max)
			.step(this.cfg.maxW.step)
			.name(this.cfg.maxW.name)
			.onChange(() => this.windowResize());
		this.ctrl.bpm = this.gui.add(this.cfg.bpm, 'val')
			.min(this.cfg.bpm.min)
			.max(this.cfg.bpm.max)
			.step(this.cfg.bpm.step)
			.name(this.cfg.bpm.name)
			.onChange(() => {
				this.uniforms.u_bpm.value = this.cfg.bpm.val; // eslint-disable-line
			});
		this.ctrl.motifH = this.gui.add(this.cfg.motifH, 'val')
			.min(this.cfg.motifH.min)
			.max(this.cfg.motifH.max)
			.step(this.cfg.motifH.step)
			.name(this.cfg.motifH.name)
			.onChange(() => {
				this.uniforms.u_motif_h.value = this.cfg.motifH.val; // eslint-disable-line
			});
		this.ctrl.bandH = this.gui.add(this.cfg.bandH, 'val')
			.min(this.cfg.bandH.min)
			.max(this.cfg.bandH.max)
			.step(this.cfg.bandH.step)
			.name(this.cfg.bandH.name)
			.onChange(() => {
				this.uniforms.u_band_h.value = this.cfg.bandH.val; // eslint-disable-line
			});

		this.ctrl.bandH = this.gui.add(this.cfg.aa, 'val')
			.min(this.cfg.aa.min)
			.max(this.cfg.aa.max)
			.step(this.cfg.aa.step)
			.name(this.cfg.aa.name);
	}

	windowResize(/* event */) {
		this.width = Math.min(window.innerWidth, this.cfg.maxW.val);
		this.height = Math.min(window.innerHeight, this.cfg.maxH.val);

		this.camera.aspect = this.width / this.height;
		this.renderer.setSize(this.width, this.height);

		this.pixelRatio = this.renderer.getPixelRatio();
		this.composerWidth = Math.floor(this.width / this.pixelRatio) || 1;
		this.composerHeight = Math.floor(this.width / this.pixelRatio) || 1;

		this.composer.setSize(this.composerWidth, this.composerHeight);

		this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
		this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
	}

	onMouseMove(e) {
		this.uniforms.u_mouse.value.x = e.pageX;
		this.uniforms.u_mouse.value.y = e.pageY;
	}

	animate() {
		requestAnimationFrame(() => {
			return this.animate();
		});
		this.render();
	}

	render() {
		this.uniforms.u_time.value += 0.05;
		this.ssaaRenderPass.sampleLevel = config.aa.val;
		this.composer.render();
	}
}

window.onload = function () {
	let ws = new WaveyShaders(dat, THREE);
	ws.toString();
};
