window.glslEditor = new GlslEditor('#glsl_editor', {
	canvas_size: 720,
	canvas_draggable: true,
	canvas_resizable: true,
	theme: 'material',
	watchHash: true,
	fileDrops: true,
	menu: true
});
document.body.style.backgroundColor = window.getComputedStyle(glslEditor.editor.getWrapperElement(),null).getPropertyValue('background-color');
