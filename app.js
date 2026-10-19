import * as THREE from 'three';

let camera, scene, renderer;
let controller1, controller2;
let raycaster;
const intersectObjects = [];

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    scene.add(controller2);

    // --- 3D BUTTONS AT EYE LEVEL ---
    const actionButton = create3DButton('Click Me', 0x4CAF50, 0, 1.3, -1.5);
    scene.add(actionButton);
    actionButton.userData = { onClick: () => alert('Action Button Clicked!') };
    intersectObjects.push(actionButton);

    const exitButton = create3DButton('Exit AR', 0xf44336, 0, 0.95, -1.5);
    scene.add(exitButton);
    exitButton.userData = { 
        onClick: () => {
            const session = renderer.xr.getSession();
            if (session) {
                session.end();
            }
        } 
    };
    intersectObjects.push(exitButton);

    // --- HTML BUTTON HANDLER FOR AR SESSION ---
    const enterVrBtn = document.getElementById('enter-vr-btn');
    enterVrBtn.textContent = 'Enter Transparent AR';
    
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            if (supported) {
                enterVrBtn.addEventListener('click', () => {
                    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] }).then((session) => {
                        renderer.xr.setSession(session);
                        enterVrBtn.style.display = 'none';
                        
                        session.addEventListener('end', () => {
                            enterVrBtn.style.display = 'block';
                        });
                    });
                });
            } else {
                enterVrBtn.textContent = 'AR Passthrough Not Supported';
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

// Helper to generate 3D button mesh with compatible rounded corners
function create3DButton(text, colorHex, x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#' + colorHex.toString(16).padStart(6, '0');
    
    // Compatible rounded rectangle path drawing
    const radius = 24;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(512 - radius, 0);
    ctx.quadraticCurveTo(512, 0, 512, radius);
    ctx.lineTo(512, 128 - radius);
    ctx.quadraticCurveTo(512, 128, 512 - radius, 128);
    ctx.lineTo(radius, 128);
    ctx.quadraticCurveTo(0, 128, 0, 128 - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    // Draw button text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(0.8, 0.2);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    
    const button = new THREE.Mesh(geometry, material);
    button.position.set(x, y, z);
    return button;
}

function onSelectStart(event) {
    const controller = event.target;
    raycaster.setFromXRController(controller);

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
