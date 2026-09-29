/* Procedural, reusable soldier. Local forward is +Z; feet rest at Y=0. */
window.createPlayerModel = function (scene) {
  const B = window.BABYLON;
  const root = new B.TransformNode('soldier', scene);
  const palette = {};
  for (const [name, color] of Object.entries({ skin: '#b88d6d', hair: '#242624', beard: '#66564a', olive: '#697258', camo: '#444e3d', sand: '#92927a', vest: '#303b39', straps: '#505953', black: '#242c2e', lens: '#344e53', metal: '#859590' })) {
    const mat = new B.StandardMaterial('soldier-' + name, scene);
    mat.diffuseColor = B.Color3.FromHexString(color);
    mat.specularColor = name === 'lens' ? new B.Color3(.35, .4, .4) : B.Color3.Black();
    palette[name] = mat;
  }
  function part(name, parent, x, y, z, w, h, d, color) {
    const mesh = B.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.parent = parent; mesh.position.set(x, y, z); mesh.material = palette[color];
    mesh.isPickable = false; return mesh;
  }
  function joint(name, x, y, z) {
    const node = new B.TransformNode(name, scene); node.parent = root; node.position.set(x, y, z); return node;
  }
  part('fatigues torso', root, 0, 1.26, 0, .59, .56, .32, 'olive');
  part('plate carrier', root, 0, 1.27, .015, .62, .45, .39, 'vest');
  part('belt', root, 0, .96, 0, .58, .09, .36, 'black');
  part('buckle', root, 0, .96, .195, .1, .065, .025, 'metal');
  for (const side of [-1, 1]) {
    part('shoulder webbing', root, side * .22, 1.5, .02, .105, .11, .39, 'straps');
    part('vest strap', root, side * .23, 1.29, .22, .065, .36, .045, 'straps');
    part('magazine pouch', root, side * .105, 1.17, .255, .17, .22, .1, 'straps');
    part('pouch flap', root, side * .105, 1.25, .313, .17, .05, .025, 'vest');
  }
  part('neck', root, 0, 1.58, 0, .19, .16, .19, 'skin');
  part('head', root, 0, 1.79, .005, .34, .38, .31, 'skin');
  part('jaw stubble', root, 0, 1.65, .075, .3, .1, .19, 'beard');
  part('chin', root, 0, 1.655, .17, .17, .055, .025, 'skin');
  part('mouth', root, 0, 1.697, .168, .115, .018, .018, 'beard');
  part('nose', root, 0, 1.76, .18, .065, .1, .07, 'skin');
  part('hair cap', root, 0, 1.976, -.015, .36, .105, .32, 'hair');
  const sweep = part('swept hair', root, -.045, 2.025, .02, .26, .08, .26, 'hair'); sweep.rotation.z = -.12;
  part('back hair', root, 0, 1.85, -.145, .34, .23, .045, 'hair');
  for (const side of [-1, 1]) {
    part('ear', root, side * .181, 1.78, -.01, .045, .105, .075, 'skin');
    part('sideburn', root, side * .166, 1.84, .045, .025, .16, .1, 'hair');
    part('sunglass frame', root, side * .087, 1.832, .175, .168, .115, .04, 'black');
    part('smoked lens', root, side * .087, 1.833, .198, .137, .078, .013, 'lens');
    part('glasses arm', root, side * .175, 1.85, .06, .024, .027, .25, 'black');
  }
  part('glasses bridge', root, 0, 1.845, .19, .04, .025, .04, 'black');
  part('radio', root, -.23, 1.42, -.255, .16, .24, .13, 'black');
  part('radio antenna', root, -.25, 1.77, -.255, .018, .5, .018, 'black');
  part('backpack', root, 0, 1.25, -.26, .4, .4, .2, 'vest');
  part('backpack panel', root, 0, 1.25, -.375, .29, .27, .04, 'straps');
  const arms = [], legs = [], knees = [];
  for (const side of [-1, 1]) {
    const arm = joint('arm pivot', side * .405, 1.48, 0); arms.push(arm);
    part('shoulder pad', arm, side * .025, -.015, 0, .255, .12, .29, 'camo');
    const leg = joint('hip pivot', side * .16, .93, 0); legs.push(leg);
    part('upper trouser leg', leg, 0, -.19, 0, .265, .38, .29, 'olive');
    const knee = new B.TransformNode('knee pivot', scene);
    knee.parent = leg; knee.position.y = -.4; knees.push(knee);
    part('lower trouser leg', knee, 0, -.175, 0, .25, .35, .28, 'olive');
    part('cargo pocket', leg, side * .145, -.18, 0, .055, .21, .23, 'camo');
    part('knee pad', leg, 0, -.43, .155, .21, .22, .065, 'vest');
    part('knee inset', leg, 0, -.43, .196, .145, .14, .025, 'straps');
    part('boot', leg, 0, -.79, .045, .28, .26, .4, 'black');
    part('boot sole', leg, 0, -.895, .05, .29, .05, .42, 'vest');
    for (let i = 0; i < 3; i++) {
      part('boot lace', leg, 0, -.73 - i * .04, .25, .13, .018, .015, 'straps');
      part('trouser camouflage', leg, side * .04, -.1 - i * .23, -.15, .14, .1, .015, i % 2 ? 'sand' : 'camo');
    }
    // Move lower-leg details onto the knee joint, retaining their rest positions.
    for (const mesh of leg.getChildren()) {
      if (mesh !== knee && mesh.position.y <= -.4) {
        mesh.parent = knee; mesh.position.y += .4;
      }
    }
  }
  // Build connected sleeve segments between explicit shoulder, elbow, and wrist points.
  function segment(name, parent, from, to, width, height, color) {
    const a = B.Vector3.FromArray(from), b = B.Vector3.FromArray(to);
    const mid = a.add(b).scale(.5);
    const mesh = part(name, parent, mid.x, mid.y, mid.z, width, height, B.Vector3.Distance(a, b), color);
    mesh.rotationQuaternion = B.Quaternion.FromLookDirectionLH(b.subtract(a).normalize(), B.Vector3.Up());
    return mesh;
  }
  function gripHands(weapon) {
    const node = weapon.root;
    const r = weapon.triggerHand, l = weapon.supportHand;
    // Palm beside the grip, fingers wrapping its front; left palm below the fore-end.
    part('right palm', node, r.x + .061, r.y, r.z, .055, .12, .095, 'black');
    part('right thumb', node, -.04, -.13, .3, .035, .075, .08, 'black');
    for (let i = 0; i < 3; i++) part('right wrapped finger', node, .008, -.17 - i * .032, .362, .12, .025, .034, 'black');
    part('straight index finger', node, .087, -.105, .37, .025, .028, .13, 'black');
    part('left supporting palm', node, l.x, l.y, l.z, .17, .065, .14, 'black');
    for (let i = 0; i < 4; i++) part('left wrapped finger', node, -.079, -.052, .665 + i * .033, .035, .105, .026, 'black');
    part('left thumb', node, .077, -.045, .73, .035, .09, .08, 'black');
    part('left knuckle protection', node, -.1, -.073, .72, .02, .06, .125, 'straps');
  }
  const rifle = window.createRifleModel(scene, root);
  rifle.root.position.set(.22, 1.4, .1);
  gripHands(rifle);
  segment('right upper sleeve', root, [.405, 1.46, 0], [.5, 1.13, .16], .21, .22, 'olive');
  segment('right forearm', root, [.5, 1.13, .16], [.285, 1.21, .39], .17, .18, 'olive');
  segment('left upper sleeve', root, [-.405, 1.46, 0], [-.39, 1.12, .3], .21, .22, 'olive');
  segment('left forearm', root, [-.39, 1.12, .3], [.18, 1.285, .78], .17, .18, 'olive');
  // Camera rig moves as one object so walking never separates gloves from the rifle.
  const hands = new B.TransformNode('first person arms', scene);
  const viewRifle = window.createRifleModel(scene, hands);
  viewRifle.root.position.set(.24, -.3, .2);
  viewRifle.root.rotation.y = -.13;
  gripHands(viewRifle);
  // Sleeves use rifle-local coordinates to meet exactly the same grip anchors.
  segment('view right sleeve', viewRifle.root, [.24, -.42, -.07], [.065, -.2, .28], .18, .18, 'olive');
  segment('view left sleeve', viewRifle.root, [-.65, -.42, .06], [-.045, -.12, .68], .18, .18, 'olive');
  for (const mesh of hands.getChildMeshes()) {
    mesh.renderingGroupId = 1;
  }
  // Clear world depth before the viewmodel so nearby walls cannot cut through it.
  scene.setRenderingAutoClearDepthStencil(1, true, true, true);
  const upper = new B.TransformNode('upper body animation pivot', scene);
  upper.parent = root; upper.position.y = .93;
  for (const child of root.getChildren()) {
    if (child !== upper && !legs.includes(child)) {
      child.parent = upper; child.position.y -= .93;
    }
  }
  let phase = 0, motion = 0, run = 0, idleTime = 0;
  function animate(dt, speed = 0, sprinting = false) {
    dt = Math.max(0, Math.min(dt, .05));
    const blend = 1 - Math.exp(-12 * dt);
    motion += (Math.min(speed / 4, 1) - motion) * blend;
    run += ((sprinting && speed > .1 ? 1 : 0) - run) * blend;
    idleTime += dt;
    phase += dt * (8 + 5 * run) * motion;
    const sway = Math.sin(phase), step = Math.cos(phase * 2);
    // Animate the complete holding assembly together to preserve both hand grips.
    hands.position.set(sway * (.009 + .009 * run) * motion,
      -run * .075 + step * (.008 + .012 * run) * motion + Math.sin(idleTime * 1.5) * .0015 * (1 - motion),
      -run * .025);
    hands.rotation.set(run * .14 + step * .008 * motion, sway * .012 * motion,
      run * -.12 + sway * .018 * motion);
    upper.rotation.x = (.025 + .08 * run) * motion;
    upper.rotation.z = sway * .018 * motion;
    upper.position.y = .93 + step * .012 * motion;
    for (let i = 0; i < legs.length; i++) {
      const swing = Math.sin(phase + i * Math.PI);
      legs[i].rotation.x = swing * (.32 + .23 * run) * motion;
      knees[i].rotation.x = -Math.max(0, swing) * (.55 + .4 * run) * motion;
    }
    // Keep the lowest boot on the display surface rather than dipping through it.
    let bottom = Infinity;
    for (const leg of legs) for (const mesh of leg.getChildMeshes()) {
      if (mesh.name === 'boot sole') {
        mesh.computeWorldMatrix(true);
        bottom = Math.min(bottom, mesh.getBoundingInfo().boundingBox.minimumWorld.y);
      }
    }
    if (Number.isFinite(bottom)) root.position.y += -bottom;
  }
  return { root, hands, arms, legs, knees, rifle, viewRifle, animate };
};
