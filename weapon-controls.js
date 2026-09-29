/* Input and visual feedback for the playable rifle. Timers advance only during play. */
window.createWeaponControls = function (scene, camera, player, isActive) {
  const B = window.BABYLON;
  const capacity = 32, reloadDuration = 2.1;
  let ammo = capacity, reload = 0, cooldown = 0, burst = 0;
  let aiming = false, aim = 0, kick = 0, flashTime = 0;
  const rifle = player.viewRifle;
  const hud = document.getElementById('ammo');
  const status = document.getElementById('weapon-status');
  const flash = B.MeshBuilder.CreateSphere('muzzle flash', { diameter: .13, segments: 4 }, scene);
  flash.parent = rifle.root; flash.position.set(0, .025, 1.13); flash.scaling.z = 1.8;
  const flashMat = new B.StandardMaterial('flash material', scene);
  flashMat.emissiveColor = new B.Color3(1, .7, .2); flashMat.disableLighting = true;
  flash.material = flashMat; flash.isPickable = false; flash.renderingGroupId = 1; flash.setEnabled(false);
  const marks = [];
  const markMat = new B.StandardMaterial('impact material', scene);
  markMat.diffuseColor = new B.Color3(.15, .14, .12);
  const magazineParts = rifle.root.getChildMeshes().filter(m => m.name === 'magazine' || m.name === 'magazine rib');
  const magazineRest = magazineParts.map(m => m.position.clone());
  let audio;
  function sound(frequency, duration, volume) {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio = audio || new Audio();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(frequency, audio.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, audio.currentTime + duration);
      gain.gain.setValueAtTime(volume, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
      osc.connect(gain); gain.connect(audio.destination);
      osc.start(); osc.stop(audio.currentTime + duration);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } catch (_) { /* Sound is optional when browser audio is unavailable. */ }
  }
  function shoot() {
    ammo--; kick = Math.min(1, kick + .7); flashTime = .045;
    sound(160, .09, .12);
    const hit = scene.pickWithRay(camera.getForwardRay(120), mesh =>
      mesh.isPickable && mesh.isEnabled() && mesh.isVisible && mesh.renderingGroupId === 0);
    if (hit && hit.hit && hit.pickedPoint) {
      const mark = B.MeshBuilder.CreateSphere('bullet impact', { diameter: .055, segments: 4 }, scene);
      mark.position.copyFrom(hit.pickedPoint); mark.material = markMat; mark.isPickable = false;
      marks.push(mark);
      if (marks.length > 40) marks.shift().dispose();
    }
  }
  function startReload() {
    if (!isActive() || reload > 0 || ammo === capacity) return;
    reload = reloadDuration; burst = 0; aiming = false; sound(280, .12, .04);
  }
  document.addEventListener('mousedown', event => {
    if (!isActive()) return;
    if (event.button === 2) { event.preventDefault(); aiming = true; }
    if (event.button === 0 && !reload && !burst && cooldown <= 0) {
      if (ammo > 0) burst = Math.min(4, ammo);
      else { cooldown = .25; sound(70, .035, .04); }
    }
  });
  document.addEventListener('mouseup', event => { if (event.button === 2) aiming = false; });
  document.getElementById('game').addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    if (isActive() && event.code === 'KeyR') { event.preventDefault(); if (!event.repeat) startReload(); }
  });
  function release() { aiming = false; burst = 0; flashTime = 0; flash.setEnabled(false); }
  document.addEventListener('pointerlockchange', () => { if (!isActive()) release(); });
  window.addEventListener('blur', release);
  function update(dt) {
    if (!isActive()) { release(); return; }
    cooldown -= dt;
    if (reload > 0) {
      reload = Math.max(0, reload - dt);
      if (reload === 0) { ammo = capacity; sound(350, .09, .04); }
    }
    if (burst > 0 && cooldown <= 0 && !reload) {
      shoot(); burst--; cooldown = burst ? .085 : .22;
    }
    const blend = 1 - Math.exp(-16 * dt);
    aim += ((aiming && !reload ? 1 : 0) - aim) * blend;
    kick *= Math.exp(-16 * dt); flashTime = Math.max(0, flashTime - dt);
    flash.setEnabled(flashTime > 0);
    // Align the rear aperture and front post with the screen center while aiming.
    rifle.root.position.set(.24 * (1 - aim), -.3 + .03 * aim, .2 + .04 * aim);
    rifle.root.rotation.y = -.13 * (1 - aim);
    camera.fov = 1.12 + (.76 - 1.12) * aim;
    player.hands.position.scaleInPlace(1 - aim);
    player.hands.rotation.scaleInPlace(1 - aim);
    player.hands.position.z -= kick * .035;
    player.hands.rotation.x -= kick * .025;
    const progress = reload ? 1 - reload / reloadDuration : 0;
    const dip = Math.sin(progress * Math.PI);
    player.hands.position.y -= dip * .22;
    player.hands.rotation.z -= dip * .35;
    for (let i = 0; i < magazineParts.length; i++) {
      magazineParts[i].position.copyFrom(magazineRest[i]);
      magazineParts[i].position.y -= Math.sin(Math.PI * progress) * .35;
    }
    document.body.classList.toggle('aiming', aim > .8);
    hud.textContent = String(ammo).padStart(2, '0') + ' / ' + capacity;
    status.textContent = reload ? 'RELOADING…' : ammo === 0 ? 'EMPTY · PRESS R' : '4-ROUND BURST · R RELOAD';
  }
  return { update, get busy() { return aiming || reload > 0 || burst > 0 || cooldown > 0; } };
};
