/* Relay: a small static environment. All coordinates are in meters. */
(() => {
  'use strict';
  const canvas = document.getElementById('game');
  const menu = document.getElementById('menu');
  const enter = document.getElementById('enter');
  const message = document.getElementById('message');
  if (!window.BABYLON) {
    message.textContent = 'The 3D engine could not load. Check your internet connection and reload.';
    enter.textContent = 'Engine unavailable';
    return;
  }
  const B = window.BABYLON;
  let engine;
  try { engine = new B.Engine(canvas, true, { stencil: false, powerPreference: 'high-performance' }); }
  catch (error) { message.textContent = 'WebGL is unavailable. Try a browser with hardware acceleration enabled.'; return; }
  engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5));
  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(.57, .69, .72, 1);
  scene.fogMode = B.Scene.FOGMODE_LINEAR;
  scene.fogStart = 45; scene.fogEnd = 115;
  scene.fogColor = new B.Color3(.57, .69, .72);
  const camera = new B.UniversalCamera('player', new B.Vector3(0, 1.75, -15), scene);
  camera.minZ = .08; camera.maxZ = 180; camera.fov = 1.12;
  camera.rotation.set(0, -.12, 0);
  // Movement is horizontal and swept in small steps against simple solid boxes.
  // This keeps walking predictable without a physics dependency or flying when looking up.
  camera.inputs.clear();
  const ambient = new B.HemisphericLight('sky', new B.Vector3(0, 1, 0), scene);
  ambient.intensity = .85; ambient.groundColor = new B.Color3(.28, .34, .36);
  const sun = new B.DirectionalLight('sun', new B.Vector3(-.6, -1, .45), scene);
  sun.intensity = 1.35; sun.diffuse = new B.Color3(1, .88, .7);
  const materials = {};
  function material(name, hex, emissive = false) {
    const m = new B.StandardMaterial(name, scene);
    m.diffuseColor = B.Color3.FromHexString(hex);
    m.specularColor = B.Color3.Black();
    if (emissive) m.emissiveColor = m.diffuseColor.scale(.8);
    materials[name] = m; return m;
  }
  material('concrete', '#a6b4ae'); material('edge', '#657c7d');
  material('dark', '#293f49'); material('metal', '#49616b');
  material('ground', '#718486'); material('tile', '#849592');
  material('orange', '#df9b51'); material('white', '#dce0cc');
  material('cyan', '#77d6d7', true); material('glass', '#294c5b');
  material('sand', '#b1b29b');
  const solids = [];
  function box(name, x, y, z, w, h, d, mat, solid = false) {
    const mesh = B.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.position.set(x, y, z); mesh.material = materials[mat];
    mesh.freezeWorldMatrix();
    if (solid) solids.push({ x, z, hw: w / 2, hd: d / 2 });
    return mesh;
  }
  function sign(text, x, y, z, width = 4, height = 1, rotation = 0) {
    const texture = new B.DynamicTexture('sign-' + text, { width: 1024, height: 256 }, scene, false);
    texture.drawText(text, null, 164, 'bold 92px Arial', '#d9e8dc', '#293f49', true);
    const mat = new B.StandardMaterial('label-' + text, scene);
    mat.diffuseTexture = texture; mat.emissiveColor = new B.Color3(.25, .25, .25); mat.specularColor = B.Color3.Black();
    const plane = B.MeshBuilder.CreatePlane(text, { width, height }, scene);
    plane.position.set(x, y, z); plane.rotation.y = rotation; plane.material = mat;
  }
  box('desert', 0, -.35, 0, 250, .4, 250, 'sand');
  box('courtyard foundation', 0, -.12, 0, 40, .24, 44, 'ground');
  // Concrete seams and an inset central landing pad are flat and walkable.
  for (let x = -18; x <= 18; x += 6) box('pavement seam', x, .004, 0, .035, .008, 43, 'edge');
  for (let z = -21; z <= 21; z += 6) box('pavement seam', 0, .004, z, 39, .008, .035, 'edge');
  box('landing pad', 0, .012, 1, 12, .02, 12, 'dark');
  for (const x of [-5.7, 5.7]) box('pad border', x, .026, 1, .12, .012, 11.5, 'orange');
  for (const z of [-4.7, 6.7]) box('pad border', 0, .026, z, 11.5, .012, .12, 'orange');
  for (const x of [-1.25, 1.25]) box('landing H', x, .03, 1, .45, .015, 3.8, 'white');
  box('landing H crossbar', 0, .03, 1, 2.5, .015, .45, 'white');
  for (let z = -18; z < -5; z += 2) box('approach stripe', 0, .018, z, .16, .015, .8, 'white');
  for (const x of [-20, 20]) {
    box('side perimeter', x, 2, 0, .8, 4, 44, 'concrete', true);
    box('wall cap', x, 4.05, 0, 1, .22, 44, 'dark');
    box('wall lower band', x * .978, .55, 0, .08, .6, 44, 'edge');
    for (let z = -20; z <= 20; z += 5) {
      box('wall buttress', x * .978, 2, z, .55, 4.2, .6, 'edge', true);
      box('wall light', x * .961, 2.9, z, .12, .14, .85, 'cyan');
    }
  }
  for (const z of [-22, 22]) {
    box('end perimeter', 0, 2, z, 40, 4, .8, 'concrete', true);
    box('end cap', 0, 4.05, z, 40, .22, 1, 'dark');
  }
  // North communications building: chunky silhouettes, inset facade, rooftop equipment.
  box('communications building', 0, 3, 18.2, 17, 6, 6.4, 'concrete', true);
  box('building base', 0, .45, 14.93, 17.3, .9, .3, 'edge');
  box('roof lip', 0, 6.05, 18, 18, .4, 7, 'dark');
  box('upper orange trim', 0, 5.55, 14.94, 17, .22, .15, 'orange');
  box('door frame', 0, 1.8, 14.7, 3.6, 3.6, .5, 'dark');
  box('closed entry door', 0, 1.65, 14.4, 2.7, 3.3, .15, 'metal');
  box('door seam', 0, 1.65, 14.3, .045, 3.3, .05, 'dark');
  box('entry light', 0, 3.48, 14.35, 2.8, .12, .08, 'cyan');
  for (const x of [-5.6, 5.6]) {
    box('window frame', x, 2.9, 14.87, 4.3, 1.9, .25, 'dark');
    box('window', x, 2.9, 14.71, 3.9, 1.5, .1, 'glass');
    box('window divider', x, 2.9, 14.63, .12, 1.5, .1, 'edge');
    box('window glint', x, 3.55, 14.64, 3.9, .045, .04, 'cyan');
  }
  sign('07 / COMMUNICATIONS', 0, 4.65, 14.7, 8, .85);
  box('rooftop unit', -5, 6.8, 18, 3, 1.2, 2.4, 'metal');
  for (let x = -6; x < -3.9; x += .35) box('vent fin', x, 6.8, 16.76, .12, .8, .04, 'dark');
  box('antenna pedestal', 4, 6.6, 19, 1.5, .9, 1.5, 'edge');
  box('antenna mast', 4, 9.5, 19, .16, 5, .16, 'dark');
  for (const y of [8.6, 9.7, 10.5]) box('antenna crossbar', 4, y, 19, 2.3, .09, .09, 'metal');
  box('antenna beacon', 4, 12.05, 19, .2, .2, .2, 'orange');
  // Supply module and crates leave wide paths around the central pad.
  box('supply module', -15.4, 1.8, 6, 6, 3.6, 8, 'metal', true);
  box('supply roof', -15.4, 3.65, 6, 6.4, .2, 8.4, 'dark');
  for (let x = -18; x < -12.5; x += .65) box('supply ribs', x, 1.8, 1.96, .08, 3.4, .09, 'edge');
  box('supply stripe', -15.4, 2.9, 1.88, 5.9, .25, .06, 'orange');
  sign('SUPPLY / 02', -15.4, 2, 1.8, 4, .65);
  function crate(x, z, size = 1.7) {
    box('cargo crate', x, size / 2, z, size, size, size, 'metal', true);
    box('cargo lid', x, size + .05, z, size + .1, .15, size + .1, 'dark');
    for (const dx of [-size * .32, size * .32]) box('cargo strap', x + dx, size / 2, z - size / 2 - .025, .12, size, .05, 'orange');
  }
  crate(-12, -8); crate(-14.2, -8); crate(-14.2, -10.2); crate(14.6, 8, 2.2); crate(12, 8, 1.7);
  for (const x of [-9, 9]) {
    box('barricade', x, .65, -3, 3.7, 1.3, .8, 'concrete', true);
    box('barricade cap', x, 1.32, -3, 3.8, .12, .9, 'edge');
    for (let dx = -1.4; dx <= 1.4; dx += .7) box('barrier marker', x + dx, .95, -3.411, .33, .25, .035, 'orange');
  }
  // South gate and a utility bank on the east side.
  box('south gate', 0, 1.85, -21.5, 7, 3.7, .3, 'dark');
  for (let x = -3; x <= 3; x += .5) box('gate ribs', x, 1.8, -21.3, .09, 3.4, .12, 'metal');
  sign('ACCESS / 07', 0, 3.1, -21.1, 4, .6, Math.PI);
  for (const z of [-8, -4, 0]) {
    box('utility cabinet', 18, 1.3, z, 2, 2.6, 2.6, 'dark', true);
    box('utility face', 16.95, 1.4, z, .08, 1.9, 2.1, 'metal');
    box('utility indicator', 16.88, 2, z, .05, .1, 1.3, 'cyan');
  }
  for (const x of [-17, 17]) for (const z of [-17, 13]) {
    box('light pole', x, 3.1, z, .16, 6.2, .16, 'dark', true);
    box('light arm', x, 6.2, z, 1.7, .16, .18, 'dark');
    box('light fixture', x, 6.1, z, 1.1, .1, .5, 'white');
  }
  // Low-poly distant terrain: deterministic placement, no downloaded assets.
  for (let i = 0; i < 18; i++) {
    const angle = i * Math.PI * 2 / 18;
    const hill = B.MeshBuilder.CreateCylinder('distant ridge', { diameterBottom: 22 + i % 4 * 7, diameterTop: 5, height: 10 + i % 5 * 4, tessellation: 5 }, scene);
    hill.position.set(Math.sin(angle) * 83, 2, Math.cos(angle) * 83);
    hill.rotation.y = angle; hill.material = materials.edge; hill.freezeWorldMatrix();
  }
  const player = window.createPlayerModel(scene);
  player.root.setEnabled(false);
  player.hands.parent = camera;
  player.hands.setEnabled(false);
  // A separate studio scene avoids camera clipping against courtyard walls during inspection.
  const studio = new B.Scene(engine);
  studio.clearColor = new B.Color4(.075, .11, .13, 1);
  const studioCamera = new B.ArcRotateCamera('model orbit', Math.PI / 2 - .35, 1.3, 3.7, new B.Vector3(0, 1.05, 0), studio);
  studioCamera.lowerRadiusLimit = 2.4; studioCamera.upperRadiusLimit = 5;
  studioCamera.lowerBetaLimit = .3; studioCamera.upperBetaLimit = 1.65;
  studioCamera.wheelPrecision = 60; studioCamera.panningSensibility = 0;
  new B.HemisphericLight('studio fill', new B.Vector3(0, 1, 1), studio).intensity = 1.1;
  new B.DirectionalLight('studio key', new B.Vector3(-1, -2, -3), studio).intensity = 1.5;
  const preview = window.createPlayerModel(studio); preview.hands.setEnabled(false);
  const pedestal = B.MeshBuilder.CreateCylinder('display plinth', { diameter: 1.5, height: .1, tessellation: 12 }, studio);
  pedestal.position.y = -.06;
  const pedestalMat = new B.StandardMaterial('plinth finish', studio);
  pedestalMat.diffuseColor = new B.Color3(.19, .25, .26); pedestal.material = pedestalMat;
  const inspect = document.getElementById('inspect');
  const modelUI = document.getElementById('model-ui');
  let inspecting = false;
  const previewMotion = document.getElementById('preview-motion');
  inspect.disabled = false;
  inspect.addEventListener('click', () => {
    inspecting = true; menu.hidden = true; modelUI.hidden = false;
    document.body.classList.add('inspecting'); studioCamera.attachControl(canvas, true);
  });
  function closeInspection() {
    inspecting = false; modelUI.hidden = true; menu.hidden = false;
    document.body.classList.remove('inspecting'); studioCamera.detachControl();
  }
  document.getElementById('close-model').addEventListener('click', closeInspection);
  document.addEventListener('keydown', event => { if (inspecting && event.code === 'Escape') closeInspection(); });
  const keys = new Set();
  let active = false;
  let returningFromDialogue = false;
  const resumeDialogue = document.getElementById('resume-dialogue');
  function resumeAfterDialogue() {
    returningFromDialogue = true; menu.hidden = true; keys.clear();
    resumeDialogue.hidden = false;
    try {
      const request = canvas.requestPointerLock();
      if (request && request.catch) request.catch(() => { resumeDialogue.hidden = false; });
    } catch (_) { resumeDialogue.hidden = false; }
  }
  resumeDialogue.addEventListener('click', resumeAfterDialogue);
  const npc = window.createCourtyardNPC(scene, camera, () => {
    active = false; keys.clear(); menu.hidden = true;
    player.hands.setEnabled(false); camera.fov = 1.12;
    document.body.classList.remove('playing', 'aiming');
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }, resumeAfterDialogue, () => {
    active = false; keys.clear(); returningFromDialogue = false;
    menu.hidden = true; resumeDialogue.hidden = true; player.hands.setEnabled(false);
    document.body.classList.remove('playing', 'aiming');
    document.getElementById('mission-complete').hidden = false;
    document.getElementById('restart-mission').focus();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  });
  document.getElementById('restart-mission').addEventListener('click', () => window.location.reload());
  const valeCollider = { x: npc.root.position.x, z: npc.root.position.z, hw: .48, hd: .48 };
  solids.push(valeCollider, { x: npc.engineer.position.x, z: npc.engineer.position.z, hw: .48, hd: .48 },
    { x: 5.7, z: 12.5, hw: .45, hd: .3 });
  document.querySelector('.location p').textContent = 'Find Corporal Vale beside the approach path. E to talk.';
  const weapon = window.createWeaponControls(scene, camera, player, () => active && !inspecting);
  const radius = .35;
  function blocked(x, z) {
    return solids.some(s => Math.abs(x - s.x) < s.hw + radius && Math.abs(z - s.z) < s.hd + radius);
  }
  function pause() {
    active = false; keys.clear(); menu.hidden = npc.talking || returningFromDialogue || npc.complete;
    document.body.classList.remove('playing'); enter.textContent = 'Enter courtyard';
  }
  enter.disabled = false; enter.textContent = 'Enter courtyard';
  message.textContent = 'Desktop keyboard and mouse recommended. Esc releases the cursor.';
  enter.addEventListener('click', () => {
    if (!canvas.requestPointerLock) { message.textContent = 'Mouse capture is unavailable. Open this page in a desktop browser.'; return; }
    try {
      const request = canvas.requestPointerLock();
      if (request && request.catch) request.catch(() => { message.textContent = 'Click Enter courtyard again to allow mouse capture.'; });
    } catch (error) { message.textContent = 'Mouse capture was blocked. Try opening the page in its own browser tab.'; }
  });
  document.addEventListener('pointerlockchange', () => {
    active = document.pointerLockElement === canvas && !npc.complete;
    if (active) {
      returningFromDialogue = false; resumeDialogue.hidden = true;
      menu.hidden = true; document.body.classList.add('playing'); canvas.focus();
    }
    else pause();
  });
  document.addEventListener('pointerlockerror', () => {
    if (returningFromDialogue) resumeDialogue.hidden = false;
    else message.textContent = 'Mouse capture was blocked. Click Enter courtyard to try again.';
  });
  document.addEventListener('mousemove', event => {
    if (!active) return;
    camera.rotation.y += event.movementX * .002;
    camera.rotation.x = Math.max(-1.45, Math.min(1.45, camera.rotation.x + event.movementY * .002));
  });
  const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'];
  document.addEventListener('keydown', event => { if (active && movementKeys.includes(event.code)) { event.preventDefault(); keys.add(event.code); } });
  document.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', () => { keys.clear(); if (document.pointerLockElement === canvas) document.exitPointerLock(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) keys.clear(); });
  const bearing = document.getElementById('bearing');
  engine.runRenderLoop(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, .05);
    npc.update(dt, active && !inspecting);
    valeCollider.x = npc.root.position.x; valeCollider.z = npc.root.position.z;
    if (inspecting) {
      const gait = previewMotion.value;
      preview.animate(dt, gait === 'sprint' ? 7 : gait === 'walk' ? 4 : 0, gait === 'sprint');
      studio.render(); return;
    }
    player.hands.setEnabled(active);
    let actualSpeed = 0, sprinting = false;
    if (active) {
      const forward = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'));
      const right = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
      const length = Math.hypot(forward, right) || 1;
      sprinting = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && !weapon.busy;
      const distance = dt * (sprinting ? 7 : 4);
      const oldX = camera.position.x, oldZ = camera.position.z;
      const dx = (Math.sin(camera.rotation.y) * forward + Math.cos(camera.rotation.y) * right) / length * distance;
      const dz = (Math.cos(camera.rotation.y) * forward - Math.sin(camera.rotation.y) * right) / length * distance;
      const steps = Math.max(1, Math.ceil(distance / .1));
      for (let i = 0; i < steps; i++) {
        if (!blocked(camera.position.x + dx / steps, camera.position.z)) camera.position.x += dx / steps;
        if (!blocked(camera.position.x, camera.position.z + dz / steps)) camera.position.z += dz / steps;
      }
      actualSpeed = dt > 0 ? Math.hypot(camera.position.x - oldX, camera.position.z - oldZ) / dt : 0;
    }
    player.animate(dt, actualSpeed, sprinting);
    weapon.update(dt);
    const degrees = ((camera.rotation.y * 180 / Math.PI) % 360 + 360) % 360;
    bearing.textContent = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8] + ' / ' + String(Math.floor(degrees)).padStart(3, '0') + '°';
    scene.render();
  });
  window.addEventListener('resize', () => engine.resize());
})();
