var canvas = document.getElementById("canvas");

// キーコード（上下左右）
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

// レンダリング領域設定：画面の半分で設定
var renderingArea = {width: 0, height:0};
renderingArea.width = window.innerWidth / 2;
renderingArea.height = window.innerHeight / 2;

// Renderer:
var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(renderingArea.width, renderingArea.height);
renderer.alpha = true;
renderer.domElement.data = new Uint8ClampedArray(renderer.domElement.width * renderer.domElement.height * 4);

// Scene:
var scene = new THREE.Scene();

// Camera:
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// キーボードのイベントを監視し、カメラ座標更新
document.addEventListener("keydown", (event) => {
    if (event.keyCode === LEFT_KEY) {
        camera.position.x -= 1;
    }
    if (event.keyCode === UP_KEY) {
        camera.position.z -= 1;
    }
    if (event.keyCode === RIGHT_KEY) {
        camera.position.x += 1;
    }
    if (event.keyCode === DOWN_KEY) {
        camera.position.z += 1;
    }
});

// Object 1:
var material = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x111111, shininess: 200});
var sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
sphere1.position.set(-1, 0, 0);
scene.add(sphere1);

// Object 2:
var material2 = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    specular: 0xffffff,
    shininess: 100,
    reflectivity: 1.0
});
var sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material2);
sphere2.position.set(1, 0, 0);
scene.add(sphere2);

// Object 3:
var plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), material);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -1;
scene.add(plane);

// Light:        
var light = new THREE.PointLight(0xffffff, 1, 0);
light.position.set(10, 10, 10);
scene.add(light);

// Raycaster: 
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, Infinity);
var mouse = new THREE.Vector2();

/*
 * レイトレースする
 */
function traceRay(ray) {
    var intersections = ray.intersectObjects(scene.children, true);
    if (intersections.length > 0) {
        var intersection = intersections[0];
        var material = intersection.object.material;
        var color = new THREE.Color();
        color.copy(material.color);
        return color;
    } else {
        return new THREE.Color(0x000000);
    }
}

/*
 * レンダリングを行う
 */
function render() {
    requestAnimationFrame(render);

    // 中心座標を計算する
    const center = new THREE.Vector3();
    center.x = (window.innerWidth / 2) - 1;
    center.y = -((window.innerHeight / 2) - 1);
    center.z = 0;

    // 処理時間の計測に使用
    var startTime = Date.now();

    // ピクセルごとにレイを発射して色を計算する
    for (var i = 0; i < renderer.domElement.width; i++) {
        for (var j = 0; j < renderer.domElement.height; j++) {
            const direction = new THREE.Vector3();
            direction.x = i - center.x;
            direction.y = -j + center.y;
            direction.z = -((window.innerWidth / 2) / Math.tan(Math.PI * camera.fov / 360));

            const origin = camera.position;

            // raycasterのrayの値を更新する
            raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
            raycaster.ray.direction.copy(direction).unproject(camera).sub(raycaster.ray.origin).normalize();

            var color = traceRay(raycaster);

            var pixelIndex = (i + j * renderer.domElement.width) * 4;
            renderer.domElement.data[pixelIndex] = color.r * 255;
            renderer.domElement.data[pixelIndex + 1] = color.g * 255;
            renderer.domElement.data[pixelIndex + 2] = color.b * 255;
            renderer.domElement.data[pixelIndex + 3] = color.a * 255;
        }
    }
    var endTime = Date.now();
    
    // テキスト更新
    document.getElementById("rendering-time").textContent = "Rendering time: " + (endTime - startTime) + "ms";
    renderer.render(scene, camera);
}
render();