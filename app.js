import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

let camera, scene, renderer;

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Add a basic light source
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Setup WebXR AR session with DOM Overlay
    const overlayContainer = document.getElementById('overlay-container');
    
    document.body.appendChild(ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
        domOverlay: { root: overlayContainer }
    }));

    // Handle UI switching when entering/exiting XR
    renderer.xr.addEventListener('sessionstart', () => {
        document.getElementById('enter-vr-btn').style.display = 'none';
        document.getElementById('action-container').style.display = 'flex';
    });

    renderer.xr.addEventListener('sessionend', () => {
        document.getElementById('enter-vr-btn').style.display = 'block';
        document.getElementById('action-container').style.display = 'none';
    });

    // Action button click logic inside AR
    document.getElementById('action-btn').addEventListener('click', () => {
        alert('Button clicked!');
    });

    // Exit VR button click logic
    document.getElementById('exit-vr-btn').addEventListener('click', () => {
        const session = renderer.xr.getSession();
        if (session) {
            session.end();
        }
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
