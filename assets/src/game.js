/**Contains properties relating to the gameplay loop.*/
let game = {
  /**Contains properties relating to the world the game is in.*/
  world: {
    bloons: [],
    towers: [],
    particles: [],
    shakes: [],
    bullets: [],
  },
  /**The game state.*/
  state: "start-menu",
  /** The player's inventory */
  inventory: {
    cash: 0,
    bloon_gold: 0,
    /** Bloon types in inventory */
    bloons: {
      reds: 0,
      blues: 0,
      greens: 0,
      yellows: 0,
      pinks: 0,
      blacks: 0,
      purples: 0,
      whites: 0,
      zebras: 0,
      leads: 0,
      rainbows: 0,
      ceramics: 0,
      moabs: 0,
      bfbs: 0,
      zomgs: 0,
      ddts: 0,
      bads: 0,
    },
    /** Powerups in storage */
    powerups: {},
  },
  /** Experience points */
  xp: 0,
  /** XP level */
  level: 0,
  /** Map the game is in. */
  map: null,
  /** Difficulty of the current game, not map. Affects tower spawning. */
  difficulty: 0
};
/** Contains properties relating to the user interface */
let ui = {
  setUp: false,
  sidebar: "hidden",
  currentFPS: 0,
  previousFPS: [],
  /** UI animation part and progress storage */
  anims: {},
  font: null,
  mapPageDifficulty: 0,
  mapMenuPage: 1,
  selectedBloonType: 0,
  get orderedBloonTypes() {
    return bloonRegistry.getKeys();
  },
};

/**Represents the current in-world mouse.*/
let mouse = {
  x: 0,
  y: 0,
};
/**Represents the current in-world camera.*/
let camera = {
  x: 0,
  y: 0,
};
let waitingForKeyRelease = false;

let { world, player, state } = game;

let sortedMaps;

game.map = mapRegistry.get("grasslands");
loadTowersFrom(game.map);
setTitleBarExtras(": Grasslands");
refreshWindowTitle();

let particleLayer, lightingLayer;
let luckiestGuyStatic;

function preload() {
  noTextureError = loadImage("assets/textures/error.png");
  error = noTextureError;
  luckiestGuyStatic = loadFont("assets/font/LuckiestGuy-Regular.ttf");
  //load all second-level images
  for (let type in images) {
    for (let instance in images[type]) {
      images[type][instance] = loadImage(
        "assets/textures/" + type + "/" + instance + ".png"
      );
    }
  }
}

function setup() {
  createCanvas(800, 800);
  particleLayer = createGraphics(800, 800);
  lightingLayer = createGraphics(800, 800);
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont(luckiestGuyStatic);
  bloonRegistry.forEach((x) => x.update());
  setupAnimations();

  game.inventory.cash += 100;

  //Sort maps
  sortedMaps = [[], [], [], [], []];
  mapRegistry.forEach((map) => {
    sortedMaps[map.difficulty].push(map);
  });
}

/** Makes a bloon on the current map. Optionally takes a parameter for the track index to place the bloon on. */
function makeBloon(type = "red", trackIndex = 0) {
  if (!bloonRegistry.get(type)) {
    BMDConsole.error("Invalid bloon type: '" + type + "' (Does not exist)");
    return;
  }
  if (!bloonRegistry.get(type).create) {
    BMDConsole.error(
      "Invalid bloon type: '" + type + "' (No 'create()' function)"
    );
    return;
  }
  let blon = bloonRegistry.get(type).create(world, game.map, trackIndex);
  world.bloons.push(blon);
  //blon.addStatus({ effect: "cold", time: 180 });
}

function mousePressed() {}

function keyPressed() {}

function draw() {
  handleErrors(tick)
  renderConsole(0, 700, LEFT)
}

function tick(){
  clear();
  tickMouse();
  if (state === "start-menu") {
    startMenu();
  } else if (state === "map-select") {
    selectMenu();
  } else if (state === "game") {
    image(images.maps[game.map.background], 400, 400, 800, 800);
    gameLoop();
    drawOffsetGame();
    drawInGameUI();
  } else {
    BMDConsole.error("Invalid game state: '" + state + "'");
    state = "start-menu";
  }
}

function tickMouse() {
  if (!mouseIsPressed) {
    waitingForKeyRelease = false;
  }
}

function renderGameAt(x, y, gameScale, maxX, maxY) {
  push();
  translate(x, y);
  scale(gameScale);
  push();
  clip(() => {
    push();
    rectMode(CORNER);
    rect(0, 0, maxX, maxY);
    pop();
  });
  push();
  rectMode(CORNER);
  fill(0);
  rect(0, 0, maxX, maxY);
  pop();
  drawOffsetGame(maxX / 2, maxY / 2);
  pop();
  pop();
  resetCamera();
}

function resetCamera() {
  camera.x = -400;
  camera.y = -400;
  mouse.x = mouseX + camera.x;
  mouse.y = mouseY + camera.y;
}

function drawOffsetGame(offsetX = 0, offsetY = 0) {
  push();
  camera.x = offsetX;
  camera.y = offsetY;
  translate(-camera.x, -camera.y);
  mouse.x = mouseX + camera.x;
  mouse.y = mouseY + camera.y;
  push();
  calculateScreenShake();
  translate(world.screenOffsetX, world.screenOffsetY);
  drawGame();
  pop();
  pop();
}

function gameLoop() {
  tickEntities();
  tickBullets();
  tickParticles();
}

function drawGame() {
  drawEntities();
  drawBullets();
  drawParticles();
}

function tickParticles() {
  for (let p of world.particles) {
    p.step(1);
    if (p.remove) {
      world.particles.splice(world.particles.indexOf(p), 1);
    }
  }
}

function drawEntities() {
  for (let e of world.towers) {
    e.draw();
  }
  for (let e of world.bloons) {
    e.draw();
  }
}

function drawBullets() {
  for (let b of world.bullets) {
    b.show();
  }
}

function drawParticles() {
  push();
  particleLayer.clear();
  particleLayer.blendMode(ADD);
  for (let p of world.particles) {
    p.show(particleLayer);
  }
  image(particleLayer, 400, 400, 800, 800);
  pop();
}

function tickEntities() {
  for (let e of world.towers) {
    e.tick();
  }
  for (let e of world.bloons) {
    e.tick();
    for (let b of world.bullets) {
      if (b.collidesWith(e)) {
        if (b.pierce <= 0) {
          createVisualEffect(b.hitEffect, e.x, e.y, b.direction);
          if (b.damage > 0) {
            e.damage(b.damage, b.attributableEntity);
          }
          if (!(b.splashDamage > 0 && b.splashRadius > 0)) {
            b.applyStatusesTo(e);
          }
          b.remove = true;
        } else {
          if (!b.pierced.includes(e)) {
            b.onHit(e, e.x, e.y);
            if (b.damage > 0) {
              e.damage(b.damage, b.attributableEntity);
            }
            b.applyStatusesTo(e);
            b.pierce--;
            b.pierced.push(e);
          }
        }
      }
    }
  }
}

function tickBullets() {
  for (let b of world.bullets) {
    if (!b.created) {
      createVisualEffect(b.shootEffect, b.x, b.y, b.direction);
      b.created = true;
    }
    if (b.remove) {
      for (let f = 0; f < b.fragNumber; f++) {
        let newBullet = b.frag();
        world.bullets.push(newBullet);
      }
      if (b.splashDamage > 0 && b.splashRadius > 0) {
        splashDamageInstance(
          b.x,
          b.y,
          b.splashDamage,
          b.splashRadius,
          b.attributableEntity,
          b.status,
          b.statusDuration,
          b.statusStacks,
          b.splashEffect,
          b.splashShake
        );
      }
      createVisualEffect(b.despawnEffect, b.x, b.y, b.direction);
      b.onRemove();
      //createVisualEffect(b.hitEffect, b.x, b.y)
      world.bullets.splice(world.bullets.indexOf(b), 1);
    }
    let newBullets = b.interval();
    if (newBullets) {
      world.bullets = world.bullets.concat(newBullets);
    }
    b.step(1, world);
  }
}

function startMenu() {
  push();
  clear();
  background(...colours.ui.accent);

  let ani = ui.anims.startMenuIntro;
  if (ani.progress < ani.length) {
    ani.progress++;
  }
  for (let part of ani.parts) {
    let partX = part.x + part.deltaX * ani.progress;
    let partY = part.y + part.deltaY * ani.progress;
    if (part.image instanceof p5.Image) {
      push();
      if (part.flip) {
        translate(partX, partY);
        scale(-1, 1);
        translate(-partX, -partY);
      }
      RADImage(
        part.image,
        partX,
        partY,
        part.image.width * (part.scale * part.deltaScale * ani.progress),
        part.image.height * (part.scale * part.deltaScale * ani.progress),
        radians(part.rot + part.deltaRot * ani.progress)
      );
      pop();
    }
  }

  //Title
  showTitleAt(400, 100);

  //Start button
  {
    push();
    noStroke();
    fill(...colours.ui.buttons.contrast);
    textSize(30);
    text("Map: " + game.map.displayName, 400, 770);
    pop();
  }
  button(340, 700, 150, 80, "Start", () => {
    state = "game";
  });
  button(490, 700, 80, 80, "Map\nSelect", () => {
    state = "map-select";
  });

  pop();
}

function selectMenu() {
  background(colours.ui.background);

  {
    //for(let difficulty = 0; difficulty < sortedMaps.length; difficulty ++){
    let difficulty = ui.mapPageDifficulty;
    push();
    let showX = 160,
      showY = 160;
    noStroke();
    fill(...colours.ui.buttons.contrast);
    textSize(50);
    text(names.difficulties[difficulty] + " Maps", 400, 30);
    let len = Math.min(6, sortedMaps[difficulty].length);
    for (let mapIndex = 0; mapIndex < len; mapIndex++) {
      let map = sortedMaps[difficulty][mapIndex + 6 * (ui.mapMenuPage - 1)];
      if (map) {
        mapButton(showX, showY, map);
      }
      showX += 240;
      if (showX > 720) {
        showX = 160;
        showY += 260;
      }
      if (showY > 720) {
        break;
      }
    }
    pop();
    //}
  }

  if (
    ui.mapMenuPage < Math.round(sortedMaps[ui.mapPageDifficulty].length / 6)
  ) {
    button(750, 700, 40, 80, ">", () => {
      ui.mapMenuPage++;
    });
  }
  if (ui.mapMenuPage > 1) {
    button(50, 700, 40, 80, "<", () => {
      ui.mapMenuPage--;
    });
  }
}

function showTitleAt(x, y) {
  noStroke();
  let txtPosCoefficient =
    ui.anims.startMenuIntro.progress / ui.anims.startMenuIntro.length;
  textSize(50 * txtPosCoefficient);
  fill(colours.title.monkey.main);
  stroke(colours.title.monkey.outline);
  strokeWeight(7);
  text("Monkey", x - 90 * txtPosCoefficient, y + 4 + 110 * txtPosCoefficient);
  text("Monkey", x - 90 * txtPosCoefficient, y + 2 + 110 * txtPosCoefficient);
  text("Monkey", x - 90 * txtPosCoefficient, y + 110 * txtPosCoefficient);

  //to 330, 200
  textSize(50 * txtPosCoefficient);
  fill(colours.title.doom.main);
  stroke(colours.title.doom.outline);
  strokeWeight(7);
  text("Doom", x + 110 * txtPosCoefficient, y + 4 + 110 * txtPosCoefficient);
  text("Doom", x + 110 * txtPosCoefficient, y + 2 + 110 * txtPosCoefficient);
  text("Doom", x + 110 * txtPosCoefficient, y + 110 * txtPosCoefficient);

  //to 490, 200
  textSize(120);
  fill(colours.title.bloons.main);
  stroke(colours.title.bloons.outline);
  strokeWeight(10);
  text("Bloons", x, y + 34);
  text("Bloons", x, y + 30);
  text("Bloons", x, y + 26);
  text("Bloons", x, y + 22);
}

/**
 * Creates a button for 1 frame. When pressed, activates the `onPress` function parameter. If the `draw` parameter is false, then the button won't be visible.
 * Can only display text
 */
function button(
  x = 0,
  y = 0,
  width = 30,
  height = 30,
  shownText = "",
  onPress = () => {},
  draw = true
) {
  push();
  if (draw) {
    rectMode(CENTER);
    stroke(...colours.ui.buttons.contrast);
    strokeWeight(5);
  }
  let hovered =
    mouseX > x - width / 2 &&
    mouseX < x + width / 2 &&
    mouseY < y + height / 2 &&
    mouseY > y - height / 2;
  if (hovered) {
    if (draw) {
      noFill();
      rect(x, y, width, height);
      fill(...colours.ui.buttons.highlight);
    }
  } else {
    if (draw) {
      fill(...colours.ui.buttons.main);
    }
  }
  if (mouseIsPressed && !waitingForKeyRelease) {
    if (hovered) {
      waitingForKeyRelease = true;
      onPress();
    }
  }

  if (draw) {
    rect(x, y, width, height);
    textSize(30); //starting point for checks
    textSize(((textSize() * width) / textWidth(shownText)) * 0.8);
    fill(...colours.ui.buttons.contrast);
    noStroke();
    textAlign(CENTER, CENTER);
    text(shownText, x, y /*, width, height*/);
  }
  pop();
  return false;
}

/**
 * A button that shows an image instead of text. Identical to a button made with `button`.
 */
function imageButton(
  x = 0,
  y = 0,
  width = 30,
  height = 30,
  shownImage = error,
  onPress = () => {},
  draw = true
) {
  push();
  if (draw) {
    rectMode(CENTER);
    stroke(...colours.ui.buttons.contrast);
    strokeWeight(5);
  }
  let hovered =
    mouseX > x - width / 2 &&
    mouseX < x + width / 2 &&
    mouseY < y + height / 2 &&
    mouseY > y - height / 2;
  if (hovered) {
    if (draw) {
      noFill();
      rect(x, y, width, height);
      fill(...colours.ui.buttons.highlight);
      tint(128);
    }
  } else {
    if (draw) {
      fill(...colours.ui.buttons.main);
    }
  }
  if (mouseIsPressed && !waitingForKeyRelease) {
    if (hovered) {
      waitingForKeyRelease = true;
      onPress();
    }
  }

  if (draw) {
    rect(x, y, width, height);
    image(shownImage, x, y, width - 10, height - 10);
  }
  pop();
  return false;
}

function captionedImageButton(
  x = 0,
  y = 0,
  width = 30,
  height = 30,
  shownImage = error,
  shownText = "",
  onPress = () => {},
  draw = true
) {
  push();
  imageButton(x, y, width, height, shownImage, onPress, draw);
  textSize(30); //starting point for checks
  textSize(((textSize() * width) / textWidth(shownText)) * 0.8);
  fill(...colours.ui.buttons.contrast);
  noStroke();
  textAlign(CENTER, CENTER);
  text(shownText, x, y + textSize() * 1 + height / 2 /*, width, height*/);
  pop();
}

function mapButton(x, y, map) {
  captionedImageButton(
    x,
    y,
    200,
    200,
    images.maps[map.background],
    map.displayName,
    () => {
      game.map = map;
      loadTowersFrom(game.map);
      state = "start-menu";
      setTitleBarExtras(": " + map.displayName);
      refreshWindowTitle();
    }
  );
}

function drawInGameUI() {
  push();
  fill(0, 255, 255);
  noStroke();

  //FPS counter
  {
    push();
    textAlign(LEFT, CENTER);
    fill(255);
    noStroke();
    if (frameRate()) {
      ui.previousFPS.push(frameRate());
      if (ui.previousFPS.length > 30) {
        ui.previousFPS.splice(0, 1);
      }
      const sum = ui.previousFPS.reduce((a, b) => a + b, 0);
      const avg = sum / ui.previousFPS.length || 0;
      ui.currentFPS = avg;
    }
    textSize(15);
    text(roundNum(ui.currentFPS, 0) + " FPS", 5, 112);
    pop();
  }
  //Mouse position
  {
    push();
    textAlign(LEFT, CENTER);
    fill(255);
    noStroke();
    textSize(15);
    text(
      "Mouse pos: " + roundNum(mouseX, 0) + ", " + roundNum(mouseY, 0),
      5,
      132
    );
    pop();
  }
  //Moneys
  {
    let originX = 235;
    let originY = 25;
    push();
    fill(...colours.ui.background, 150);
    stroke(...colours.ui.accent);
    strokeWeight(10);
    rect(originX, originY, 300, 60);
    fill(colours.ui.cash);
    noStroke();
    textSize(20);
    textSize(
      Math.min(30, (textSize() * 100) / textWidth(game.inventory.cash)) * 0.8
    );
    textAlign(LEFT, CENTER);
    image(images.ui.coin, originX - 120, originY - 1, 40, 40);
    text(game.inventory.cash, originX - 100, originY + 2);
    textSize(
      Math.min(30, (textSize() * 100) / textWidth(game.inventory.bloon_gold)) *
        0.8
    );
    textAlign(LEFT, CENTER);
    image(images.ui.bloon_gold, originX + 2, originY - 1, 32, 40);
    fill(colours.ui.bloon_gold);
    text(game.inventory.bloon_gold, originX + 25, originY + 2);
    pop();
  }
  //XP and level
  {
    game.level = game.xp; //temporary
    push();
    noFill();
    stroke(...colours.ui.accent);
    strokeWeight(5);
    rect(40, 40, 90, 90);
    fill(colours.ui.xp);
    stroke(255);
    textSize(20);
    textSize(
      Math.min(50, (textSize() * 100) / textWidth("$" + game.level)) * 0.8
    );
    textAlign(CENTER, CENTER);
    RADImage(images.ui.xp_bg, 40, 40, 90, 90, frameCount / 60);
    RADImage(images.ui.xp_bg, 40, 40, 90, 90, 0);
    text(game.level, 40, 40);
    pop();
  }

  button(730, 770, 100, 40, "Shop", () => {
    ui.sidebar = "bloons-shop";
  });

  button(730, 720, 100, 40, "Bloons", () => {
    ui.sidebar = "bloons";
  });

  //draw sidebar
  drawSidebar();
  pop();
}

function drawSidebar() {
  push();
  if (ui.sidebar !== "hidden") {
    push();
    strokeWeight(10);
    stroke(...colours.ui.accent);
    fill(...colours.ui.background, 150);
    rect(715, 330, 230, 700);
    pop();
    button(630, 30, 40, 40, "<-", () => {
      ui.sidebar = "hidden";
    });
  }
  if (ui.sidebar === "bloons") {
    stroke(255);
    strokeWeight(5);
    fill(0);
    textSize(30);
    text("Bloons", 725, 36);

    bloonSendButton(
      700,
      100,
      ui.orderedBloonTypes[ui.selectedBloonType],
      prices.cash.bloons[ui.orderedBloonTypes[ui.selectedBloonType]]
    );
    button(630, 140, 30, 30, "<", () => {
      if (ui.selectedBloonType > 0) ui.selectedBloonType--;
    });
    button(770, 140, 30, 30, ">", () => {
      if (ui.selectedBloonType < ui.orderedBloonTypes.length - 1)
        ui.selectedBloonType++;
    });
    textSize(5); //starting point for checks
    textSize(
      Math.min(
        30,
        ((textSize() * 100) /
          textWidth(ui.orderedBloonTypes[ui.selectedBloonType])) *
          0.8
      )
    );
    text(ui.orderedBloonTypes[ui.selectedBloonType], 700, 140, 100);

  }
  if (ui.sidebar === "bloons-shop") {
    stroke(255);
    strokeWeight(5);
    fill(0);
    textSize(30);
    text("Shop", 725, 36);

    //Buy button
    bloonBuyButton(
      700,
      100,
      ui.orderedBloonTypes[ui.selectedBloonType],
      prices.cash.bloons[ui.orderedBloonTypes[ui.selectedBloonType]]
    );
    button(630, 140, 30, 30, "<", () => {
      if (ui.selectedBloonType > 0) ui.selectedBloonType--;
    });
    button(770, 140, 30, 30, ">", () => {
      if (ui.selectedBloonType < ui.orderedBloonTypes.length - 1)
        ui.selectedBloonType++;
    });
    textSize(5); //starting point for checks
    textSize(
      Math.min(
        30,
        ((textSize() * 100) /
          textWidth(ui.orderedBloonTypes[ui.selectedBloonType])) *
          0.8
      )
    );
    text(ui.orderedBloonTypes[ui.selectedBloonType], 700, 140, 100);
  }
  pop();
}

function bloonSendButton(x, y, bloon) {
  let img = images.art[bloon] ?? images.bloons[bloon];
  if (!img) {
    BMDConsole.error("Image not found for bloon " + bloon);
    img = noTextureError;
  }
  image(img, x - 70, y, img.width / 2, img.height / 2);
  if (game.inventory.bloons[bloon + "s"] == null) {
    BMDConsole.error("There is no slot in your inventory for " + bloon + "s");
    return;
  }

  strokeWeight(5);
  stroke(colours.ui.buttons.contrast);
  fill(colours.ui.buttons.main);
  rect(x - 20, y, 40, 30);
  noStroke();
  fill(colours.ui.buttons.contrast);
  textSize(5); //starting point for checks
  textSize(
    ((textSize() * 40) / textWidth("x" + game.inventory.bloons[bloon + "s"])) *
      0.8
  );
  text("x" + game.inventory.bloons[bloon + "s"], x - 20, y);
  button(x + 40, y, 40, 30, "-->", () => {
    if (game.inventory.bloons[bloon + "s"] >= 1) {
      game.inventory.bloons[bloon + "s"]--;
      makeBloon(bloon);
    }
  });
}

function bloonBuyButton(x, y, bloon, price) {
  let img = images.art[bloon] ?? images.bloons[bloon];
  if (!img) {
    BMDConsole.error("Image not found for bloon '" + bloon + "'");
    img = noTextureError;
  }
  image(img, x - 70, y, img.width / 2, img.height / 2);
  if (game.inventory.bloons[bloon + "s"] == null) {
    BMDConsole.error("There is no slot in your inventory for '" + bloon + "'s");
    return;
  }

  strokeWeight(5);
  stroke(colours.ui.buttons.contrast);
  fill(colours.ui.buttons.main);
  rect(x - 20, y, 40, 30);
  rect(x + 73, y, 40, 30);

  noStroke();
  fill(colours.ui.buttons.contrast);

  textSize(5); //starting point for checks
  textSize(
    ((textSize() * 40) / textWidth("x" + game.inventory.bloons[bloon + "s"])) *
      0.8
  );
  text("x" + game.inventory.bloons[bloon + "s"], x - 20, y);

  textSize(5); //starting point for checks
  textSize(((textSize() * 40) / textWidth("x" + price)) * 0.8);
  text("$" + price, x + 73, y);

  button(x + 27, y, 30, 30, "+", () => {
    if (game.inventory.cash >= price) {
      game.inventory.cash -= price;
      game.inventory.bloons[bloon + "s"]++;
    }
  });
}

function calculateScreenShake() {
  let intensity = 0;
  for (let s of world.shakes) {
    if (s.duration > 0) {
      intensity += s.intensity;
      s.intensity = s.maxIntensity ** (s.duration / s.maxDuration);
      s.duration--;
    } else {
      world.shakes.splice(world.shakes.indexOf(s), 1);
    }
  }
  world.screenOffsetX = rnd(intensity, -intensity);
  world.screenOffsetY = rnd(intensity, -intensity);
}

function splashDamageInstance(
  centreX,
  centreY,
  amount,
  damageRadius,
  attributableEntity = null,
  status = null,
  statusDuration = 60,
  statusStacks = 1,
  showExplosion = true,
  hasShake = true,
  decay = true
) {
  let radius = damageRadius ** 1.05;
  if (showExplosion != null ? showExplosion : true) {
    for (let i = 0; i < radius ** 0.48; i++) {
      world.particles.push(
        new ShapeParticle(
          centreX,
          centreY,
          radians(rnd(0, 360)),
          rnd(radius ** 0.65, radius ** 0.8 * 2),
          rnd(radius ** 0.25 * 0.3, radius ** 0.25 * 0.5),
          0.01,
          "circle",
          [100, 100, 100, 200],
          [100, 100, 100, 0],
          radius ** 0.7,
          0,
          radius ** 0.7,
          0
        )
      );
    }
    for (let i = 0; i < radius ** 0.7 * 2; i++) {
      world.particles.push(
        new ShapeParticle(
          centreX,
          centreY,
          radians(rnd(0, 360)),
          rnd(radius ** 0.75, radius ** 0.75 * 1.5),
          rnd(radius ** 0.25 * 0.1, radius ** 0.25 * 2),
          0.075,
          "rect",
          [255, 245, 215, 255],
          [255, 215, 0, 55],
          radius ** 0.4,
          0,
          radius ** 0.6,
          radius ** 0.4
        )
      );
    }
    world.particles.push(
      new WaveParticle(
        centreX,
        centreY,
        30,
        0,
        damageRadius,
        [255, 255, 255, 255],
        [255, 128, 0, 0],
        20,
        0
      )
    );
  }
  if (hasShake) {
    shake(
      centreX,
      centreY,
      ((radius * amount) ** 0.5) ** 0.75 * 2,
      ((radius * amount) ** 0.5) ** 0.8
    );
  }
  let entitiesToDamage = [];
  for (let e of world.bloons) {
    if (
      e.getPos().distanceTo(new Vector(centreX, centreY)) <=
        damageRadius + e.getSize() &&
      e != attributableEntity
    ) {
      entitiesToDamage.push(e);
    }
  }
  for (let e of entitiesToDamage) {
    const damageToTake = decay
      ? (amount *
          (damageRadius -
            (e.getPos().distanceTo(new Vector(centreX, centreY)) -
              e.getSize()))) /
        damageRadius
      : amount;
    for (let i = 0; i < statusStacks; i++) {
      if (status != "null" && statusDuration) {
        e.addStatus({
          effect: status,
          time: statusDuration,
        });
      }
    }
    e.damage(roundNum(damageToTake, 0));
  }
}

function loadTowersFrom(map) {
  world.towers.splice(0, world.towers.length);
  if(!map) return;
  if(!map.towers) return;
  for (let tower of map.towers[game.difficulty]) {
    let towerType = tower.type
    if(towerType.split(":").length === 1){
      towerType = towerType + ":0"
    }
    let towerClass = towerRegistry.get(towerType)
    let createdTower = new towerClass(world, tower.x, tower.y);
    createdTower.setTargetingPrio(tower.target ?? "first");
    world.towers.push(createdTower);
  }
}

function setTitleBarExtras(text) {
  document.getElementById("title-extras").innerText = "" + text;
}

function refreshWindowTitle() {
  document.querySelector("title").innerText =
    (game.map?.displayName ? game.map.displayName + " - " : "") +
    "Bloons Monkey Doom";
}

function createVisualEffect(effectName, x, y, direction) {
  if (!effectName) return;
  const effect = effectRegistry.get(effectName);
  if (!effect) return;
  effect.create(world, x, y, direction);
}
