import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let camera, scene, renderer;
let controller1, controller2;
let raycaster;
const intersectObjects = [];

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);

    // Light source
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Raycaster for controller interactions
    raycaster = new THREE.Raycaster();

    // Setup controllers for interaction
    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();
    
    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    // --- 3D BUTTONS IN THE VIRTUAL SCENE ---
    
    // 1. Action Button (Green)
    const actionButton = create3DButton('Click Me', 0x4CAF50, 0, 0, -1.5);
    scene.add(actionButton);
    actionButton.userData = { onClick: () => alert('Action Button Clicked in VR!') };
    intersectObjects.push(actionButton);

    // 2. Exit VR Button (Red)
    const exitButton = create3DButton('Exit VR', 0xf44336, 0, -0.35, -1.5);
    scene.add(exitButton);
    exitButton.userData = { 
        onClick: () => {
            const session = renderer.xr.getSession();
            if (session) session.end();
        } 
    };
    intersectObjects.push(exitButton);

    // --- MANUAL HTML BUTTON HANDLER TO ENTER VR ---
    const enterVrBtn = document.getElementById('enter-vr-btn');
    
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            if (supported) {
                enterVrBtn.addEventListener('click', () => {
                    navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] }).then((session) => {
                        renderer.xr.setSession(session);
                        enterVrBtn.style.display = 'none';
                        
                        session.addEventListener('end', () => {
                            enterVrBtn.style.display = 'block';
                        });
                    });
                });
            } else {
                enterVrBtn.textContent = 'VR Not Supported';
                enterVrBtn.disabled = true;
            }
        });
    } else {
        enterVrBtn.textContent = 'WebXR Not Available';
        enterVrBtn.disabled = true;
    }

    window.addEventListener('resize', onWindowResize);
    renderer.setAnimationLoop(render);
}

// Helper to generate a 3D button mesh with text texture
function create3DButton(text, colorHex, x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#' + colorHex.toString(16).padStart(6, '0');
    context.roundRect(0, 0, 512, 128, 24);
    context.fill();

    context.fillStyle = '#ffffff';
    context.font = 'bold 48px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(0.8, 0.2);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    
    const button = new THREE.Mesh(geometry, material);
    button.position.set(x, y, z);
    return button;
}

// Handle controller trigger clicks
function onSelectStart(event) {
    const controller = event.target;
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(intersectObjects);

    if (intersects.length > 0) {
        const intersectedButton = intersects[0].object;
        if (intersectedButton.userData && intersectedButton.userData.onClick) {
            intersectedButton.userData.onClick();
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    renderer.render(scene, camera);
}
