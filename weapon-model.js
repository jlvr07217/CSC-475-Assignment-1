/* Stylized M8A1-inspired rifle geometry. +Z points toward the muzzle. */
window.createRifleModel = function (scene, parent) {
  const B = window.BABYLON;
  const root = new B.TransformNode('M8 inspired rifle', scene);
  root.parent = parent;
  const mats = {};
  for (const [key, hex] of Object.entries({ body: '#826249', edge: '#a18260', dark: '#293034', steel: '#434e52', rubber: '#1f2628' })) {
    const mat = new B.StandardMaterial('rifle ' + key, scene);
    mat.diffuseColor = B.Color3.FromHexString(hex); mat.specularColor = new B.Color3(.12, .12, .12);
    mats[key] = mat;
  }
  function box(name, x, y, z, w, h, d, material) {
    const mesh = B.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    mesh.parent = root; mesh.position.set(x, y, z); mesh.material = mats[material]; mesh.isPickable = false;
    return mesh;
  }
  box('stock', 0, -.02, .12, .13, .18, .25, 'body');
  box('butt pad', 0, -.025, -.015, .15, .21, .055, 'rubber');
  box('receiver', 0, 0, .39, .15, .19, .34, 'body');
  box('upper receiver', 0, .103, .4, .145, .065, .39, 'edge');
  box('fore end', 0, .025, .71, .13, .14, .31, 'body');
  box('under barrel rail', 0, -.063, .73, .09, .04, .28, 'dark');
  box('top rail', 0, .15, .48, .085, .04, .79, 'dark');
  for (let i = 0; i < 17; i++) box('rail tooth', 0, .177, .11 + i * .044, .11, .022, .023, 'steel');
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      box('handguard vent', side * .067, .055, .59 + i * .05, .008, .04, .029, 'dark');
      box('side rail rib', side * .083, -.015, .59 + i * .05, .026, .035, .027, 'steel');
    }
    box('receiver inset', side * .078, .025, .4, .012, .074, .18, 'dark');
    box('receiver inset panel', side * .085, .025, .42, .008, .045, .1, 'steel');
    for (const z of [.27, .51]) box('receiver fastener', side * .079, -.058, z, .012, .023, .024, 'steel');
  }
  const grip = box('pistol grip', 0, -.19, .31, .085, .2, .1, 'rubber'); grip.rotation.x = -.18;
  const magazine = box('magazine', 0, -.21, .48, .09, .24, .14, 'dark'); magazine.rotation.x = -.1;
  for (let i = 0; i < 3; i++) box('magazine rib', .05, -.15 - i * .045, .48, .012, .012, .125, 'steel');
  box('trigger guard bottom', 0, -.185, .394, .045, .02, .11, 'dark');
  box('trigger guard front', 0, -.14, .443, .045, .11, .018, 'dark');
  box('trigger', 0, -.125, .37, .02, .06, .018, 'steel');
  box('barrel', 0, .025, .94, .046, .046, .19, 'steel');
  box('muzzle device', 0, .025, 1.045, .068, .068, .07, 'dark');
  box('muzzle opening', 0, .025, 1.083, .032, .032, .008, 'rubber');
  box('rear sight base', 0, .205, .155, .085, .055, .065, 'steel');
  const ring = B.MeshBuilder.CreateTorus('rear aperture', { diameter: .076, thickness: .014, tessellation: 12 }, scene);
  ring.parent = root; ring.position.set(0, .27, .155); ring.rotation.x = Math.PI / 2; ring.material = mats.dark; ring.isPickable = false;
  box('front sight base', 0, .205, .84, .066, .075, .04, 'dark');
  for (const side of [-1, 1]) box('front sight wing', side * .029, .267, .84, .012, .07, .025, 'dark');
  box('front sight post', 0, .254, .84, .012, .045, .018, 'steel');
  // Hand anchors are shared by the inspector and camera-mounted pose.
  return { root, triggerHand: new B.Vector3(0, -.19, .31), supportHand: new B.Vector3(0, -.105, .72) };
};
