### CSC 475 Assignment 1 ###

### Courtyard Prototype

Open `hello-world.html` in a desktop browser, or use the VS Code Live Server extension.
For a local server without extensions, run `python -m http.server 8000` from this folder,
then visit `http://localhost:8000/hello-world.html`.

To deactive the server, go into your Terminal and press ctrl + c

An internet connection is needed to load the pinned Babylon.js engine from jsDelivr.
All environment geometry is generated locally; no model or texture downloads are needed.

Click **Enter courtyard** to capture the mouse. Use **WASD** or **arrow keys** to move,
the **mouse** to look, **Shift** to sprint, and **Esc** to pause/release the cursor.
Walls, buildings, barriers, and crates block movement. The courtyard is a flat walking
environment with a fixed eye height; jumping and climbing are not implemented.

The playable mission includes NPC dialogue, a player-directed NPC-to-NPC battery
delivery, restored communications, and a radio extraction request.

Files: `hello-world.html` (page), `styles.css` (interface), `courtyard.js` (scene and controls).

### Mission walkthrough

1. Approach Corporal Vale and press **E**. Choose **Take a replacement battery to Ellis.**
2. Follow Vale to the supply crates and then to Engineer Ellis beside Communications.
   Keep his path clear; he waits if you stand in front of him. Pausing also pauses delivery.
3. Watch the battery transfer and read Vale and Ellis's exchange. Ellis installs the
   battery, and the radio indicator turns green.
4. Approach Ellis, press **E**, and choose **Call Command for extraction**.
5. Advance the radio dialogue with **Continue**, then **Finish transmission**.
   The mission ends after Command's final line. **Play again** resets the mission.

Engineer Ellis has a cap, headset, and visible face inspired by the supplied reference.
Conversations are text-based. The delivery uses a fixed route and a simple item transfer;
there is no helicopter sequence. Reloading the page resets mission progress.

### Talking to Corporal Vale

A helmeted, gray-armored NPC stands just ahead and to the right of the spawn
point, beside the approach path. Walk within three meters, look toward him,
and press **E** when prompted. Choose a topic with the mouse or Tab and Enter.
Choose **Goodbye** or press **Esc** to return directly to the courtyard without
opening the pause menu. If the browser requires a new click to capture the mouse,
use the small **Click to resume looking around** button. Movement and firing pause during dialogue. Conversations are scripted
locally and do not need an AI service. Vale remembers being greeted during the
current page session. `npc.js` contains his procedural model and dialogue.

### Player Model

Walking now has a gentle weapon sway, while Shift + movement blends into a
faster, lowered sprint pose. Animation follows actual movement, so pushing
against a wall settles back to idle. The camera stays steady and both hands
remain attached to the rifle. In **Inspect player model**, choose **Idle**,
**Walk**, or **Sprint** to preview the full-body animation in place, including
hip and knee movement. Refresh with Ctrl+F5 to load the updated scripts.

Click **Inspect player model** in the start/pause menu to view the reference-inspired
blocky soldier. Drag to rotate and scroll to zoom. Click **Back to courtyard** or
press **Esc** to return. First-person play shows olive sleeves and gloved hands
with subtle movement bobbing. The full body is currently displayed in the inspector.

`player-model.js` builds the reusable model entirely from geometry, including
sunglasses, dark hair, camouflage accents, a vest, knee pads, boots, and a radio.
No additional asset downloads are required.

The player now holds a blocky M8A1-inspired rifle built in `weapon-model.js`.
The inspector shows the full-body holding pose; first-person play shows a
camera-mounted rifle with the right hand on the pistol grip and the left under
the fore-end. The hands and rifle share a parent so movement bob stays aligned.
Use **left click** for a four-round burst, **hold right click** to aim down sights,
and **R** to reload. The magazine holds 32 rounds with unlimited reserve ammo for
testing. Reloading takes 2.1 seconds and blocks firing; a full magazine cannot be
reloaded. Sprinting yields to firing, aiming, and reloading. Esc releases aiming
and cancels pending burst shots; reload progress pauses while outside gameplay.
`weapon-controls.js` handles recoil, muzzle flash, synthesized sound, magazine
animation, and up to 40 impact marks. Shots hit along the screen-center ray;
there are no damageable NPCs yet. Reload animation is a simple rifle dip and
magazine movement, rather than a detailed hand-operated magazine swap.
Use Ctrl+F5 after updating files.

### Objective ###
* give you the opportunity to familiarize yourself with the ability of cutting-edge AI to code

### Requirements ###

* Code up a 3-D game
    - must include NPCs that the player can talk to / direct
    - NPCs should also be able to interact with other NPCs



