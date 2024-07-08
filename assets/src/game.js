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
  /** Current track the game is on. */
  track: {},
};
/**Contains properties relating to the user interface*/
let ui = {
  setUp: false,
  sidebar: "hidden",
  currentFPS: 0,
  previousFPS: [],
  /** UI animation part and progress storage */
  anims: {},
  font: null,
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

const tracks = {
  test: {
    world: world,
    points: [
      { x: 85, y: 800 },
      { x: 85, y: 202 },
      { x: 662, y: 202 },
      { x: 662, y: 347 },
      { x: 410, y: 347 },
      { x: 410, y: 0 },
    ],
  },
};

game.track = tracks.test;

let particleLayer;

function preload() {
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
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("Luckiest Guy");
  //testRed.addStatus({effect: "fire", time: 240})

  setupAnimations();

  game.inventory.cash += 10
}

function makeBloon(track, type = RedBloon) {
  let blon = new type(track);
  world.bloons.push(blon);
  //blon.addStatus({ effect: "cold", time: 180 });
}

function mousePressed() {}

function keyPressed() {}

function draw() {
  tickMouse();
  if (state === "start-menu") {
    startMenu();
    //} else if (state === "select-menu") {
    //  drawOffsetGame();
    //   selectMenu();
  } else if (state === "game") {
    clear();
    image(images.maps.map1, 400, 400, 800, 800);
    gameLoop();
    drawOffsetGame();
    drawInGameUI();
  } else {
    console.error("Invalid game state: '" + state + "'");
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
  //particleLayer.background(0)
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
      if (
        (b.getPos().distanceTo(e.getPos()) < e.size + b.size ||
          b.laserCollide(e)) &&
        b.attributableEntity &&
        b.attributableEntity != e &&
        b.collides
      ) {
        if (b.pierce <= 0) {
          b.onHit(e, e.x, e.y);
          if (b.damage > 0) {
            e.damage(b.damage);
          }
          if (!(b.splashDamage > 0 && b.splashRadius > 0)) {
            b.applyStatusesTo(e);
          }
          b.remove = true;
        } else {
          if (!b.pierced.includes(e)) {
            b.onHit(e, e.x, e.y);
            if (b.damage > 0) {
              e.damage(b.damage);
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
      b.onRemove();
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
  button(400, 700, 200, 80, "Start", () => {
    state = "game";
  });

  pop();
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
  text("Bloons", x, y + 44);
  text("Bloons", x, y + 40);
  text("Bloons", x, y + 36);
  text("Bloons", x, y + 32);
}

/** Creates a button for 1 frame. When pressed, activates the `onPress` function parameter. If the `draw` parameter is false, then the button won't be visible.*/
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
    text(shownText, x, y + textSize() * 0.12 /*, width, height*/);
  }
  pop();
  return false;
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
      Math.min(30, (textSize() * 100) / textWidth("$" + game.inventory.cash)) *
        0.8
    );
    textAlign(LEFT, CENTER);
    image(images.ui.coin, originX - 120, originY - 1, 40, 40);
    text(game.inventory.cash, originX - 100, originY + 2);
    textSize(
      Math.min(
        30,
        (textSize() * 100) / textWidth("$" + game.inventory.bloon_gold)
      ) * 0.8
    );
    textAlign(LEFT, CENTER);
    image(images.ui.bloon_gold, originX + 2, originY - 1, 32, 40);
    fill(colours.ui.bloon_gold);
    text(game.inventory.bloon_gold, originX + 25, originY + 2);
    pop();
  }
  //XP and level
  {
    push();
    noFill();
    stroke(...colours.ui.accent);
    strokeWeight(10);
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
    text(game.level, 40, 40 + textSize() * 0.15);
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
    rect(720, 330, 220, 700);
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

    bloonSendButton(700, 100, "red", RedBloon);
    bloonSendButton(700, 150, "blue", BlueBloon);
    bloonSendButton(700, 200, "green", GreenBloon);
    bloonSendButton(700, 250, "yellow", YellowBloon);
    bloonSendButton(700, 300, "pink", PinkBloon);
    bloonSendButton(700, 350, "black", BlackBloon);
    bloonSendButton(700, 400, "purple", PurpleBloon);
    bloonSendButton(700, 450, "white", WhiteBloon);
    bloonSendButton(700, 500, "zebra", ZebraBloon);
    bloonSendButton(700, 550, "lead", LeadBloon);
    bloonSendButton(700, 600, "rainbow", RainbowBloon);
    bloonSendButton(700, 650, "ceramic", CeramicBloon);
  }
  if (ui.sidebar === "bloons-shop") {
    stroke(255);
    strokeWeight(5);
    fill(0);
    textSize(30);
    text("Shop", 725, 36);

    //Buy buttons
    bloonBuyButton(700, 100, "red", prices.cash.bloons.red);
    bloonBuyButton(700, 150, "blue", prices.cash.bloons.blue);
    bloonBuyButton(700, 200, "green", prices.cash.bloons.green);
    bloonBuyButton(700, 250, "yellow", prices.cash.bloons.yellow);
    bloonBuyButton(700, 300, "pink", prices.cash.bloons.pink);
    bloonBuyButton(700, 350, "black", prices.cash.bloons.black);
    bloonBuyButton(700, 400, "purple", prices.cash.bloons.purple);
    bloonBuyButton(700, 450, "white", prices.cash.bloons.white);
    bloonBuyButton(700, 500, "zebra", prices.cash.bloons.zebra);
    bloonBuyButton(700, 550, "lead", prices.cash.bloons.lead);
    bloonBuyButton(700, 600, "rainbow", prices.cash.bloons.rainbow);
    bloonBuyButton(700, 650, "ceramic", prices.cash.bloons.ceramic);
  }
  pop();
}

function bloonSendButton(x, y, bloon, bloonClass) {
  if (!images.bloons[bloon]) {
    console.error("Image not found for bloon " + bloon);
    return;
  }
  if (game.inventory.bloons[bloon + "s"] == null) {
    console.error("There is no slot in your inventory for " + bloon + "s");
    return;
  }
  if (!bloonClass) {
    console.error(bloonClass + " is not a class!");
    return;
  }
  image(
    images.bloons[bloon],
    x - 70,
    y,
    images.bloons[bloon].width / 2,
    images.bloons[bloon].height / 2
  );
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
  text("x" + game.inventory.bloons[bloon + "s"], x - 20, y + textSize() * 0.15);
  button(x + 40, y, 40, 30, "-->", () => {
    if (game.inventory.bloons[bloon + "s"] >= 1) {
      game.inventory.bloons[bloon + "s"]--;
      makeBloon(game.track, bloonClass);
    }
  });
}

function bloonBuyButton(x, y, bloon, price) {
  if (!images.bloons[bloon]) {
    console.error("Image not found for bloon " + bloon);
    return;
  }
  if (game.inventory.bloons[bloon + "s"] == null) {
    console.error("There is no slot in your inventory for " + bloon + "s");
    return;
  }
  image(
    images.bloons[bloon],
    x - 70,
    y,
    images.bloons[bloon].width / 2,
    images.bloons[bloon].height / 2
  );

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
  text("x" + game.inventory.bloons[bloon + "s"], x - 20, y + textSize() * 0.15);

  textSize(5); //starting point for checks
  textSize(((textSize() * 40) / textWidth("x" + price)) * 0.8);
  text("$" + price, x + 73, y + textSize() * 0.15);

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
    console.log(decay, damageToTake);
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
