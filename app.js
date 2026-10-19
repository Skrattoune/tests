import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

let camera, scene, renderer;

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Setup WebXR AR session with DOM Overlay targeting our HTML container
    const overlayContainer = document.getElementById('overlay-container');
    
    // Pass the session options directly into the ARButton creator
    document.body.appendChild(ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: overlayContainer }
    }));

    // Handle UI switching when entering/exiting XR
    renderer.xr.addEventListener('sessionstart', () => {
        document.getElementById('enter-vr-btn').style.display = 'none';
        document.getElementById('action-btn').style.display = 'block';
    });

    renderer.xr.addEventListener('sessionend', () => {
        document.getElementById('enter-vr-btn').style.display = 'block';
        document.getElementById('action-btn').style.display = 'none';
    });

    // Button click logic inside AR
    document.getElementById('action-btn').addEventListener('click', () => {
        alert('Button clicked!');
    });

    window.addEventListener('resize', onWindowResize);
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    renderer.render(scene, camera);
}
