/* =========================================================
   SHIVA FITNESS — CINEMATIC 3D EXPERIENCE v2
   GLB dumbbell, GSAP ScrollTrigger choreography
   Premium studio lighting, scroll-driven path
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.getElementById('dumbbell-canvas');
  if (!canvas) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  /* ---------- renderer ---------- */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.physicallyCorrectLights = true;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  /* ---------- studio lighting — premium product shoot ---------- */
  var ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  var key = new THREE.DirectionalLight(0xfff5e4, 2.2);
  key.position.set(-4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 8;
  scene.add(key);

  var fill = new THREE.DirectionalLight(0xcfe8f2, 0.9);
  fill.position.set(6, 2, 3);
  scene.add(fill);

  var rim = new THREE.DirectionalLight(0xffffff, 1.4);
  rim.position.set(1, 3, -7);
  scene.add(rim);

  var bounce = new THREE.DirectionalLight(0xf0e8d8, 0.4);
  bounce.position.set(0, -5, 2);
  scene.add(bounce);

  var hair = new THREE.DirectionalLight(0xe8f0f5, 0.7);
  hair.position.set(0, 8, 0);
  scene.add(hair);

  /* ---------- environment map for metallic reflections ---------- */
  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  var neutralEnv = pmremGenerator.fromScene(new THREE.RoomEnvironment()).texture;
  scene.environment = neutralEnv;
  pmremGenerator.dispose();

  /* ---------- dumbbell group ---------- */
  var dbGroup = new THREE.Group();
  scene.add(dbGroup);

  var dbMixer = null;

  var DB_URL = 'https://cdn.jsdelivr.net/gh/pinarohq/model@main/domyos_dumbbell%20%281%29.glb';

  /* ---------- GLB loader ---------- */
  var loader = new THREE.GLTFLoader();

  loader.load(DB_URL, function (gltf) {
    var model = gltf.scene;
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 1.6;
          child.material.needsUpdate = true;
        }
      }
    });
    var box = new THREE.Box3().setFromObject(model);
    var size = new THREE.Vector3();
    box.getSize(size);
    var maxDim = Math.max(size.x, size.y, size.z);
    var targetSize = 1.8;
    model.scale.setScalar(targetSize / maxDim);
    var center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center.multiplyScalar(targetSize / maxDim));

    dbGroup.add(model);

    if (gltf.animations && gltf.animations.length) {
      dbMixer = new THREE.AnimationMixer(model);
    }
  }, undefined, function (err) {
    console.warn('[Shiva 3D] Dumbbell GLB failed:', err);
    buildFallbackDumbbell();
  });

  /* ---------- fallback procedural dumbbell (if GLB fails) ---------- */
  function buildFallbackDumbbell() {
    var chrome   = new THREE.MeshStandardMaterial({ color: 0xb9bdc2, metalness: 1.0, roughness: 0.06, envMapIntensity: 2.0 });
    var gunmetal = new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.9, roughness: 0.22, envMapIntensity: 1.4 });
    var knurl    = new THREE.MeshStandardMaterial({ color: 0x55585c, metalness: 0.85, roughness: 0.5 });

    var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 32), chrome);
    bar.rotation.z = Math.PI / 2;
    dbGroup.add(bar);

    for (var i = -7; i <= 7; i++) {
      if (Math.abs(i) < 2) continue;
      var ring = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24), knurl);
      ring.rotation.z = Math.PI / 2;
      ring.position.x = i * 0.14;
      dbGroup.add(ring);
    }

    [-1.1, 1.1].forEach(function (x) {
      var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.18, 28), chrome);
      collar.rotation.z = Math.PI / 2;
      collar.position.x = x;
      dbGroup.add(collar);
    });

    [-1.52, 1.52].forEach(function (x) {
      var p = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.14, 40), gunmetal);
      p.rotation.z = Math.PI / 2; p.position.x = x;
      dbGroup.add(p);
    });

    [-1.34, 1.34].forEach(function (x) {
      var p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 40), gunmetal);
      p.rotation.z = Math.PI / 2; p.position.x = x;
      dbGroup.add(p);
    });

    [-1.62, 1.62].forEach(function (x) {
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.1, 24), chrome);
      cap.rotation.z = Math.PI / 2; cap.position.x = x;
      dbGroup.add(cap);
    });

    dbGroup.scale.setScalar(0.72);
  }

  /* ---------- scroll state ---------- */
  var scrollProgress = 0;

  function updateScrollProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ---------- progress bar ---------- */
  var progressEl = document.querySelector('.progress');

  function updateProgressBar() {
    if (!progressEl) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    progressEl.style.width = (ratio * 100) + '%';
  }

  window.addEventListener('scroll', updateProgressBar, { passive: true });

  /* ---------- easing helpers ---------- */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- spring physics ---------- */
  function Spring(v, stiff, damp) {
    this.value  = v;
    this.target = v;
    this.vel    = 0;
    this.stiff  = stiff  || 0.06;
    this.damp   = damp   || 0.78;
  }
  Spring.prototype.step = function () {
    var f = (this.target - this.value) * this.stiff;
    this.vel = (this.vel + f) * this.damp;
    this.value += this.vel;
  };

  var sp = {
    x:  new Spring(0.5),
    y:  new Spring(-0.05),
    rx: new Spring(0.12),
    ry: new Spring(0.4),
    rz: new Spring(0.18),
    s:  new Spring(1.0),
    cz: new Spring(6.0),
    cx: new Spring(0),
  };

  /* ---------- mouse parallax ---------- */
  var mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------- NDC to world helper ---------- */
  function ndcToWorld(nx, ny, camZ) {
    var fov  = camera.fov * Math.PI / 180;
    var halfH = Math.tan(fov / 2) * camZ;
    var halfW = halfH * camera.aspect;
    return { x: nx * halfW, y: ny * halfH };
  }

  /* ==============================================================
     CINEMATIC SCROLL WAYPOINTS
     12 sections, dumbbell travels around content, never over CTAs.
  ============================================================== */
  var DB_WP = [
    // 00 — HERO: right side, framing content
    { nx:  0.52, ny: -0.12, rx:  0.08, ry:  0.35, rz:  0.18, s: 1.1,  camZ: 5.2 },
    // 01 — STAY: upper-left corner
    { nx: -0.55, ny:  0.38, rx: -0.12, ry: -0.55, rz: -0.22, s: 0.55, camZ: 6.2 },
    // 02 — PHILOSOPHY: behind text, centered-low
    { nx:  0.00, ny:  0.10, rx:  0.25, ry:  0.75, rz:  0.10, s: 0.80, camZ: 6.8 },
    // 03 — PROGRAMS: behind cards
    { nx:  0.00, ny:  0.05, rx:  0.10, ry: -0.30, rz:  0.05, s: 0.52, camZ: 6.2 },
    // 04 — COACH: right edge
    { nx:  0.52, ny:  0.38, rx: -0.18, ry: -0.50, rz:  0.28, s: 0.52, camZ: 6.5 },
    // 05 — DIFFERENT: large, behind headline
    { nx:  0.00, ny:  0.00, rx:  0.30, ry:  1.20, rz:  0.00, s: 1.60, camZ: 4.8 },
    // 06 — GALLERY: left edge
    { nx: -0.72, ny:  0.08, rx: -0.22, ry: -0.80, rz: -0.15, s: 0.95, camZ: 5.0 },
    // 07 — TESTIMONIALS: upper-right
    { nx:  0.58, ny:  0.44, rx:  0.08, ry:  0.60, rz:  0.12, s: 0.50, camZ: 6.4 },
    // 08 — MEMBERSHIP: lower-right, behind cards
    { nx:  0.62, ny: -0.50, rx:  0.18, ry: -0.45, rz: -0.12, s: 0.70, camZ: 5.8 },
    // 09 — SAFETY: left, behind text
    { nx: -0.12, ny:  0.08, rx: -0.10, ry:  0.30, rz:  0.08, s: 0.60, camZ: 6.0 },
    // 10 — LOCATION: lower-left corner
    { nx: -0.60, ny: -0.48, rx:  0.22, ry: -0.65, rz:  0.18, s: 0.45, camZ: 6.5 },
    // 11 — BOOK (FINAL): centered, large, behind CTA
    { nx:  0.0,  ny:  0.05, rx:  0.10, ry:  0.40, rz:  0.05, s: 1.40, camZ: 4.8 },
  ];

  var N = DB_WP.length;

  /* ---------- update dumbbell targets from scroll ---------- */
  function updateDBTargets() {
    var raw = scrollProgress * (N - 1);
    var idx = Math.min(Math.floor(raw), N - 2);
    var t   = ease(raw - idx);

    var a = DB_WP[idx];
    var b = DB_WP[Math.min(idx + 1, N - 1)];

    var camZ = lerp(a.camZ, b.camZ, t);
    var w    = ndcToWorld(lerp(a.nx, b.nx, t), lerp(a.ny, b.ny, t), camZ);

    sp.x.target  = w.x;
    sp.y.target  = w.y;
    sp.rx.target = lerp(a.rx, b.rx, t);
    sp.ry.target = lerp(a.ry, b.ry, t);
    sp.rz.target = lerp(a.rz, b.rz, t);
    sp.s.target  = lerp(a.s,  b.s,  t);
    sp.cz.target = camZ;

    sp.cx.target = lerp(a.nx, b.nx, t) * 0.15;
  }

  /* ---------- overlays ---------- */
  var overlayEl     = document.getElementById('scene-overlay');
  var heroOverlayEl = document.getElementById('hero-overlay');

  var DB_OVERLAY = [
    0,    // 00 hero
    0,    // 01 stay
    0,    // 02 philosophy
    0,    // 03 programs
    0,    // 04 coach
    0.20, // 05 different
    0,    // 06 gallery
    0,    // 07 testimonials
    0,    // 08 membership
    0,    // 09 safety
    0,    // 10 location
    0.30, // 11 book/ready
  ];

  function updateOverlay() {
    if (!overlayEl) return;
    var raw = scrollProgress * (N - 1);
    var idx = Math.min(Math.floor(raw), N - 2);
    var t   = ease(raw - idx);
    var a   = DB_OVERLAY[idx];
    var b   = DB_OVERLAY[Math.min(idx + 1, N - 1)];
    overlayEl.style.opacity = lerp(a, b, t).toFixed(3);
  }

  function updateHeroOverlay() {
    if (!heroOverlayEl) return;
    var heroEnd = 1.0 / (N - 1);
    if (scrollProgress < heroEnd) {
      heroOverlayEl.classList.add('hero-active');
    } else {
      heroOverlayEl.classList.remove('hero-active');
    }
  }

  /* ---------- render loop ---------- */
  var clock = new THREE.Clock();
  var autoRotY = 0;
  var time = 0;

  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    time += delta;

    if (dbMixer) dbMixer.update(delta);

    updateDBTargets();
    updateOverlay();
    updateHeroOverlay();

    var allSprings = [sp.x, sp.y, sp.rx, sp.ry, sp.rz, sp.s, sp.cz, sp.cx];
    allSprings.forEach(function (s) { s.step(); });

    var mx = reduceMotion ? 0 : mouseX * 0.10;
    var my = reduceMotion ? 0 : mouseY * 0.07;

    dbGroup.position.x = sp.x.value + mx;
    dbGroup.position.y = sp.y.value - my + (reduceMotion ? 0 : Math.sin(time * 0.55) * 0.025);

    autoRotY += reduceMotion ? 0.002 : 0.007;
    dbGroup.rotation.x = sp.rx.value;
    dbGroup.rotation.y = autoRotY + sp.ry.value;
    dbGroup.rotation.z = sp.rz.value;
    dbGroup.scale.setScalar(sp.s.value);

    camera.position.z = sp.cz.value;
    camera.position.x += (sp.cx.value + mx * 0.2 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.15 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  /* ---------- resize ---------- */
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  animate();

})();
