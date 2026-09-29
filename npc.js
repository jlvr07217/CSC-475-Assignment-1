/* A local, scripted conversation with a procedural armored soldier. */
window.createCourtyardNPC = function (scene, camera, onOpen, onClose, onComplete) {
  const B = window.BABYLON;
  const root = new B.TransformNode('Corporal Vale', scene);
  root.position.set(3, 0, -9); root.rotation.y = Math.PI;
  const mats = {};
  for (const [name, hex] of Object.entries({ cloth: '#515c60', camo: '#343f45', light: '#738082', armor: '#333c3c', pouch: '#686754', black: '#222b30', visor: '#465962', blue: '#80cbd7' })) {
    const mat = new B.StandardMaterial('Vale ' + name, scene);
    mat.diffuseColor = B.Color3.FromHexString(hex); mat.specularColor = B.Color3.Black(); mats[name] = mat;
  }
  function part(name, x, y, z, w, h, d, material, parent = root) {
    const mesh = B.MeshBuilder.CreateBox('Vale ' + name, { width: w, height: h, depth: d }, scene);
    mesh.parent = parent; mesh.position.set(x, y, z); mesh.material = mats[material]; return mesh;
  }
  const torso = new B.TransformNode('Vale torso', scene); torso.parent = root;
  part('uniform', 0, 1.27, 0, .61, .58, .34, 'cloth', torso);
  part('vest', 0, 1.28, .02, .64, .46, .4, 'armor', torso);
  part('belt', 0, .96, 0, .6, .09, .37, 'black');
  part('belt buckle', 0, .96, .2, .1, .065, .03, 'light');
  part('neck seal', 0, 1.58, 0, .24, .14, .23, 'black', torso);
  part('balaclava', 0, 1.77, .015, .34, .32, .31, 'cloth', torso);
  part('face mask', 0, 1.69, .177, .29, .13, .07, 'light', torso);
  part('helmet', 0, 1.96, -.005, .43, .2, .39, 'armor', torso);
  part('helmet crown', 0, 2.075, -.015, .32, .07, .29, 'cloth', torso);
  part('visor frame', 0, 1.85, .183, .37, .14, .07, 'black', torso);
  part('dark visor', 0, 1.855, .226, .32, .085, .022, 'visor', torso);
  part('helmet mount', 0, 1.997, .2, .1, .09, .07, 'black', torso);
  part('unit patch', -.13, 1.455, .235, .11, .08, .025, 'blue', torso);
  part('backpack', 0, 1.26, -.29, .43, .43, .2, 'armor', torso);
  part('radio aerial', -.25, 1.72, -.24, .02, .57, .02, 'black', torso);
  for (const side of [-1, 1]) {
    part('helmet ear cover', side * .214, 1.84, -.01, .065, .18, .19, 'armor', torso);
    part('shoulder strap', side * .22, 1.48, .04, .095, .12, .4, 'pouch', torso);
    part('upper sleeve', side * .415, 1.35, 0, .22, .35, .27, 'cloth', torso);
    part('shoulder armor', side * .43, 1.49, 0, .25, .15, .3, 'armor', torso);
    part('forearm', side * .435, 1.07, .045, .2, .29, .24, 'cloth', torso);
    part('elbow armor', side * .44, 1.13, -.09, .2, .15, .08, 'armor', torso);
    part('glove', side * .435, .86, .07, .19, .16, .22, 'black', torso);
    part('knuckles', side * .435, .88, .185, .14, .07, .03, 'light', torso);
    part('trousers', side * .165, .57, 0, .27, .74, .3, 'cloth');
    part('cargo pocket', side * .302, .7, 0, .06, .22, .24, 'camo');
    part('knee guard', side * .165, .48, .17, .23, .24, .07, 'armor');
    part('boot', side * .165, .15, .04, .29, .28, .41, 'black');
    part('sole', side * .165, .035, .05, .3, .06, .43, 'armor');
    for (let i = 0; i < 3; i++) {
      part('sleeve camo', side * .425, 1.39 - i * .15, .146, .12, .075, .018, i % 2 ? 'light' : 'camo', torso);
      part('leg camo', side * .165, .79 - i * .22, -.155, .17, .095, .018, 'camo');
    }
  }
  for (let i = -1; i <= 1; i++) {
    part('mag pouch', i * .175, 1.19, .272, .145, .25, .11, 'pouch', torso);
    part('pouch flap', i * .175, 1.275, .335, .145, .045, .025, 'armor', torso);
  }
  const engineer = root.clone('Engineer Ellis', null, false);
  engineer.position.set(4, 0, 12); engineer.rotation.y = Math.PI;
  for (const mesh of engineer.getChildMeshes()) {
    if (['balaclava', 'face mask', 'helmet', 'helmet crown', 'visor frame', 'dark visor', 'helmet mount', 'helmet ear cover'].some(n => mesh.name.endsWith('Vale ' + n))) mesh.dispose();
  }
  const skin = new B.StandardMaterial('Ellis skin', scene); skin.diffuseColor = B.Color3.FromHexString('#ac896a'); mats.skin = skin;
  part('Ellis face', 0, 1.79, .015, .33, .36, .3, 'skin', engineer);
  part('Ellis nose', 0, 1.79, .19, .065, .08, .055, 'skin', engineer);
  part('Ellis mouth', 0, 1.685, .17, .11, .018, .02, 'black', engineer);
  part('Ellis cap', 0, 1.98, 0, .38, .1, .34, 'pouch', engineer);
  part('Ellis cap brim', 0, 1.94, .2, .36, .035, .2, 'pouch', engineer);
  for (const side of [-1, 1]) {
    part('Ellis eye', side * .078, 1.845, .17, .045, .026, .018, 'black', engineer);
    part('Ellis headset', side * .19, 1.81, 0, .075, .17, .13, 'black', engineer);
  }
  part('Ellis microphone boom', .21, 1.73, .12, .025, .025, .22, 'black', engineer);
  part('Ellis microphone', .15, 1.73, .23, .12, .04, .04, 'black', engineer);
  const battery = part('replacement battery', -12, 1.87, -8, .32, .26, .24, 'pouch', null);
  const radio = part('field radio', 5.7, 1.1, 12.5, .8, .5, .5, 'armor', null);
  part('radio stand', 5.7, .43, 12.5, .9, .86, .6, 'camo', null);
  const indicator = part('radio status', 5.7, 1.15, 12.235, .42, .12, .03, 'black', null);
  const online = new B.StandardMaterial('radio online', scene); online.emissiveColor = new B.Color3(.2, 1, .45);
  const objective = document.querySelector('.location p');
  const subtitle = document.getElementById('mission-subtitle');
  let state = 'ready', route = [], elapsed = 0, walkPhase = 0, selected = root;
  const legPivots = [-1, 1].map(side => {
    const pivot = new B.TransformNode('Vale walking hip', scene); pivot.parent = root; pivot.position.set(side * .165, .93, 0);
    for (const mesh of [...root.getChildMeshes()]) {
      if (mesh.parent === root && mesh.position.y < .9 && Math.sign(mesh.position.x) === side) {
        mesh.parent = pivot; mesh.position.subtractInPlace(pivot.position);
      }
    }
    return pivot;
  });
  function say(speaker, line) { subtitle.textContent = speaker + ': ' + line; subtitle.hidden = false; }
  function startDelivery() {
    if (state !== 'ready') return;
    state = 'collect'; route = [[3, -5.5], [-10, -5.5], [-11, -6.6]];
    objective.textContent = 'Follow Vale to collect the battery.';
    say('Vale', 'Copy that. I’ll collect the battery and take it to Ellis.'); close();
  }
  function missionUpdate(dt, active) {
    if (!active || talking || state === 'complete') return;
    if (route.length) {
      const [x, z] = route[0], dx = x - root.position.x, dz = z - root.position.z;
      const distance = Math.hypot(dx, dz), step = Math.min(distance, dt * 2.2);
      // Wait for the player to clear the path instead of walking through them.
      const nx = root.position.x + dx / (distance || 1) * step;
      const nz = root.position.z + dz / (distance || 1) * step;
      if (Math.hypot(camera.position.x - nx, camera.position.z - nz) < .95) return;
      root.position.set(nx, 0, nz); root.rotation.y = Math.atan2(dx, dz);
      walkPhase += dt * 8;
      legPivots.forEach((leg, i) => { leg.rotation.x = Math.sin(walkPhase + i * Math.PI) * .28; });
      if (distance < .08) route.shift();
      if (route.length) return;
      legPivots.forEach(leg => { leg.rotation.x = 0; }); elapsed = 0;
      state = state === 'collect' ? 'pickup' : 'handoff';
    }
    elapsed += dt;
    if (state === 'pickup' && elapsed > 1) {
      battery.parent = root; battery.position.set(.435, .78, .15);
      state = 'deliver'; route = [[-11.5, -5.5], [-11.5, 11], [2.8, 11]];
      objective.textContent = 'Follow Vale to Engineer Ellis at Communications.';
      say('Vale', 'Battery secured. Heading to Communications.');
    } else if (state === 'handoff') {
      root.rotation.y = Math.atan2(engineer.position.x - root.position.x, engineer.position.z - root.position.z);
      engineer.rotation.y = root.rotation.y + Math.PI;
      say('Vale', 'Ellis, here’s the replacement battery you requested.');
      if (elapsed > 3) {
        battery.parent = engineer; battery.position.set(.435, .78, .15);
        state = 'repair'; elapsed = 0;
        say('Ellis', 'Thanks, Vale. This is exactly what I need. Connecting it now.');
      }
    } else if (state === 'repair' && elapsed > 4) {
      battery.parent = null; battery.position.set(5.7, 1.48, 12.5);
      indicator.material = online; state = 'online';
      objective.textContent = 'Talk to Ellis and call Command for extraction.';
      say('Ellis', 'Communications restored. You can call Command for extraction now.');
    }
  }
  const prompt = document.getElementById('talk-prompt');
  const panel = document.getElementById('npc-dialogue');
  const text = document.getElementById('npc-speech');
  const choices = document.getElementById('npc-choices');
  let talking = false, available = false, greeted = false, time = 0;
  function options() {
    choices.replaceChildren();
    const replies = selected === engineer ? [
      ['Who are you?', 'Engineer Ellis. I maintain the station’s communications equipment.'],
      ['Radio status?', state === 'online' ? 'The radio is online. Ready when you are.' : 'The radio needs a replacement battery. Ask Vale to bring one from the supply crates.'],
      ...(state === 'online' ? [['Call Command for extraction', 'command']] : []),
      ['Goodbye', null]
    ] : [
      ['Who are you?', 'Corporal Vale, station security. I keep this courtyard clear and the supply route open.'],
      ['What is this place?', 'Outpost 07. Communications is across the landing pad; the supply module is on the west side.'],
      ['What needs doing?', state === 'online' ? 'Ellis has the radio online. Speak to the engineer to call Command for extraction.' : 'Ellis needs a replacement radio battery. Give me the order and I’ll collect one from the supply crates.'],
      ...(state === 'ready' ? [['Take a replacement battery to Ellis.', 'delivery']] : []),
      ['Goodbye', null]
    ];
    for (const [label, reply] of replies) {
      const button = document.createElement('button'); button.textContent = label;
      button.addEventListener('click', () => {
        if (reply === 'delivery') startDelivery();
        else if (reply === 'command') commandCall();
        else if (reply) text.textContent = reply;
        else close();
      }); choices.appendChild(button);
    }
    choices.firstElementChild.focus();
  }
  function close() {
    if (state === 'command' || state === 'complete') return;
    talking = false; panel.hidden = true; onClose();
  }
  function commandCall() {
    if (state !== 'online') return;
    state = 'command'; document.getElementById('npc-name').textContent = 'COMMAND / RADIO';
    panel.querySelector('small').textContent = 'Continue through the transmission to finish the mission.';
    const lines = [
      'You: Command, this is Outpost 07. Communications restored. Requesting extraction for our team.',
      'Command: Copy, Outpost 07. Signal is clear. Excellent work restoring the relay.',
      'Command: Extraction approved. Your team is cleared to return to base. Command out.'
    ];
    let index = 0; text.textContent = lines[index]; choices.replaceChildren();
    const next = document.createElement('button'); next.textContent = 'Continue'; choices.appendChild(next); next.focus();
    next.addEventListener('click', () => {
      index++;
      if (index < lines.length) {
        text.textContent = lines[index]; next.textContent = index === lines.length - 1 ? 'Finish transmission' : 'Continue';
      } else {
        state = 'complete'; talking = false; panel.hidden = true; subtitle.hidden = true;
        objective.textContent = 'Mission complete — extraction approved.'; onComplete();
      }
    });
  }
  document.addEventListener('keydown', event => {
    if (talking) {
      if (event.code === 'Escape') { event.preventDefault(); }
      if (event.code === 'Tab') {
        const buttons = [...choices.querySelectorAll('button')];
        const index = buttons.indexOf(document.activeElement);
        event.preventDefault(); buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
      }
      return;
    }
    if (event.code !== 'KeyE' || event.repeat || !available) return;
    event.preventDefault(); talking = true; available = false; prompt.hidden = true;
    document.getElementById('npc-name').textContent = selected === engineer ? 'Engineer Ellis' : 'Corporal Vale';
    text.textContent = selected === engineer ? (state === 'online' ? 'We have a clear signal. Ready to call Command?' : 'Welcome. We need a new battery to bring the radio online.') : greeted ? 'Back again? What do you need?' : 'Welcome to Outpost 07. I’m Corporal Vale. What do you need to know?';
    greeted = true; panel.hidden = false; onOpen(); options();
  });
  // Wait until Escape is released before attempting mouse capture again.
  document.addEventListener('keyup', event => {
    if (talking && event.code === 'Escape') { event.preventDefault(); close(); }
  });
  return {
    root,
    engineer,
    get complete() { return state === 'complete'; },
    get talking() { return talking; },
    update(dt, active) {
      missionUpdate(dt, active);
      time += dt; torso.position.y = Math.sin(time * 1.8) * .004;
      selected = B.Vector3.Distance(camera.position, engineer.position) < B.Vector3.Distance(camera.position, root.position) ? engineer : root;
      const target = selected.position.add(new B.Vector3(0, 1.45, 0));
      const offset = target.subtract(camera.position), distance = offset.length();
      available = false;
      if (active && !talking && (state === 'ready' || state === 'online') && distance < 3 && distance > .01) {
        selected.rotation.y = Math.atan2(camera.position.x - selected.position.x, camera.position.z - selected.position.z);
        const direction = offset.scale(1 / distance);
        if (B.Vector3.Dot(camera.getForwardRay().direction, direction) > .78) {
          const hit = scene.pickWithRay(new B.Ray(camera.position, direction, distance + .4), mesh => mesh.isPickable && mesh.isEnabled());
          available = !!(hit && hit.hit && hit.pickedMesh.isDescendantOf(selected));
        }
      }
      prompt.hidden = !available;
      prompt.textContent = selected === engineer ? 'E · Talk to Engineer Ellis' : 'E · Talk to Corporal Vale';
    }
  };
};
