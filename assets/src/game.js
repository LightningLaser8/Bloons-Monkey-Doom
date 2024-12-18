import { mapRegistry } from "./registry/maps.js";
import { towerRegistry } from "./registry/towers.js";
import { bloonRegistry } from "./registry/bloons.js";
import { effectRegistry } from "./registry/vfx.js";
import {
  title,
  colours,
  rewards,
  prices,
  images,
  setupAnimations,
  names,
  Localisation,
  modText,
} from "./universal.js";
import {
  RADImage,
  RADShape,
  noTextureError,
  ImageContainer,
  modImage,
} from "./geometry.js";
import {} from "./graphics.js";
import { setupIntegrate, loadMods } from "./integrator.js";
import { shorten, rnd, roundNum } from "./number.js";
/*
    Bloons Monkey Doom: Reverse Bloons Tower Defense
    Copyright (C) 2024 LightningLaser8

    This file is a part of Bloons Monkey Doom.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
    /** Unlocked stuff, like bloon types */
    unlocked: {
      bloons: {
        red: false,
        blue: false,
        green: false,
        yellow: false,
        pink: false,
        black: false,
        purple: false,
        white: false,
        zebra: false,
        lead: false,
        rainbow: false,
        ceramic: false,
        moab: false,
        bfb: false,
        zomg: false,
        ddt: false,
        bad: false,
      },
    },
    /** Powerups in storage */
    powerups: {},
  },
  /** Experience points */
  xp: 0,
  /** XP level */
  level: 0,
  /** Experience points until next level is earned */
  toNextLevel: 100,
  /** Map the game is in. */
  map: null,
  difficulty: 0,
  round: 0,
  lives: 100,
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
/** Represents the current on-screen mouse. */
let smouse = {
  get x() {
    return mouseX / vscale;
  },
  get y() {
    return mouseY / vscale;
  },
};
/**Represents the current in-world camera.*/
let camera = {
  x: 0,
  y: 0,
};
let waitingForKeyRelease = false;

let { world, player } = game;

let messages = [];

let sortedMaps;
let newLang = "en-gb";

loadGameFrom(mapRegistry.get("grasslands")); //To stop errors on load
changeGameState("start-menu");

let particleLayer, lightingLayer;
let luckiestGuyStatic;
let gameEndDelay = 0,
  gameEndStarted = false;

async function preload() {
  setWindowTitle("...");
  await noTextureError.load();
  luckiestGuyStatic = await loadFont("assets/font/LuckiestGuy-Regular.ttf");
  //load all second-level images
  for (let type in images) {
    for (let instance in images[type]) {
      if (images[type][instance] instanceof ImageContainer)
        await images[type][instance].load();
      else
        images[type][instance] = await loadImage(
          "assets/textures/" + type + "/" + instance + ".png"
        );
    }
  }
  //Localisation
  let lang = localStorage.getItem("lang") ?? "en-gb";
  console.log("Starting game with language :"+lang)
  setTitleBarExtras("[" + lang + "]");
  await Localisation.setup(lang);
  setTitleBarExtras();
  refreshWindowTitle();
}
/**@type {HTMLCanvasElement} */
let cnv;
let vscale = 1;
function updateSize() {
  let space = windowWidth < windowHeight ? windowWidth : windowHeight - 40;
  vscale = space / 800;
  cnv.style.scale = vscale;
  cnv.style.translate =
    "-" + (800 - windowWidth) / 2 + "px -" + (800 - space) / 2 + "px";
}

function updateLanguageRS(lang) {
  localStorage.setItem("lang", lang);
  location.reload();
}

async function updateLanguage(lang) {
  localStorage.setItem("lang", lang);
  await Localisation.setup(lang)
}

function resize() {
  updateSize();
}

function setup() {
  cnv = createCanvas(800, 800).elt;
  updateSize();
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

  setupIntegrate();
  loadMods();
}

/** Makes a bloon on the current map. Optionally takes a parameter for the track index to place the bloon on. */
function makeBloon(type = "red", trackIndex = 0) {
  if (!bloonRegistry.get(type)) {
    console.error("Invalid bloon type: '" + type + "'\n > Does not exist");
    return;
  }
  if (!bloonRegistry.get(type).create) {
    console.error(
      "Invalid bloon type: '" + type + "'\n > No 'create()' function"
    );
    console.log(bloonRegistry.get(type));
    return;
  }
  let blon = bloonRegistry.get(type).create(world, game.map, trackIndex);
  world.bloons.push(blon);
  //blon.addStatus({ effect: "cold", time: 180 });
}

function mousePressed() {}

function keyPressed() {}

function draw() {
  background(0);
  tickMouse();
  if (game.state === "start-menu") {
    startMenu();
  } else if (game.state === "main-menu") {
    mainMenu();
  } else if (game.state === "map-select") {
    mapSelectMenu();
  } else if (game.state === "lang-selector") {
    languageMenu();
  } else if (game.state === "game") {
    modImage(images.maps[game.map.background], 400, 400, 800, 800);
    gameLoop();
    drawOffsetGame();
    drawInGameUI();
  } else if (game.state === "winning-sequence") {
    modImage(images.maps[game.map.background], 400, 400, 800, 800);
    tickParticles();
    drawOffsetGame();
    drawInGameUI();

    if (!gameEndStarted && bloonDespawnEventTick()) {
      gameEndDelay = 100;
      gameEndStarted = true;
    }
    if (gameEndStarted) {
      if (gameEndDelay <= 0) {
        changeGameState("main-menu");
        gameEndStarted = false;
      } else {
        gameEndDelay--;
      }
    }
  } else {
    console.error("Invalid game state: '" + game.state + "'");
    changeGameState("start-menu");
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
  mouse.x = smouse.x + camera.x;
  mouse.y = smouse.y + camera.y;
}

function drawOffsetGame(offsetX = 0, offsetY = 0) {
  push();
  camera.x = offsetX;
  camera.y = offsetY;
  translate(-camera.x, -camera.y);
  mouse.x = smouse.x + camera.x;
  mouse.y = smouse.y + camera.y;
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
  tickXPLevels();

  if (game.lives <= 0) {
    if (game.round >= game.map.difficulties[game.difficulty].lastRound) {
      game.inventory.bloon_gold +=
        game.map.difficulties[game.difficulty].reward;
      game.round = 0;
      game.lives = 0;
      world.towers.splice(0, world.towers.length);
      game.state = "winning-sequence";
    } else {
      game.round++;
      game.inventory.cash +=
        game.map.difficulties[game.difficulty].perRoundCashBonus;
      loadCurrentRoundFrom(game.map);
    }
  }
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
  modImage(particleLayer, 400, 400, 800, 800);
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
    if (part.image) {
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
  button(400, 700, 200, 80, Localisation.text("button.start"), () => {
    //x: 340, width: 150
    changeGameState("main-menu");
    message(Localisation.text("message.standard.gamecreate"));
  });
  // button(490, 700, 80, 80, "Map\nSelect", () => {
  //   game.state = "map-select";
  // });

  pop();
}

function mapSelectMenu() {
  background(colours.ui.background);

  push();
  fill(colours.ui.accent);
  rectMode(CORNERS);
  rect(40, 60, 760, 600);
  rectMode(CENTER);
  rect(675, 740, 200, 70);
  pop();

  {
    //for(let difficulty = 0; difficulty < sortedMaps.length; difficulty ++){
    let difficulty = ui.mapPageDifficulty;
    push();
    let showX = 160,
      showY = 180;
    noStroke();
    fill(...colours.ui.buttons.contrast);
    textSize(50);
    text(
      Localisation.text(
        "category." + names.map_difficulties[difficulty] + ".name"
      ) +
        " " +
        Localisation.text("ui.menu.maps"),
      400,
      30
    );
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
    if (difficulty > 0) {
      button(100, 30, 50, 50, "<", () => {
        ui.mapPageDifficulty--;
      });
    }
    if (difficulty < 4) {
      button(700, 30, 50, 50, ">", () => {
        ui.mapPageDifficulty++;
      });
    }
    textSize(20);
    fill(colours.ui.buttons.contrast);
    text(Localisation.text("difficulty.title") + ":", 675, 720);
    modText(
      "difficulty." + names.game_difficulties[game.difficulty] + ".name",
      675,
      750
    );
    if (game.difficulty > 0) {
      button(600, 750, 30, 30, "<", () => {
        game.difficulty--;
      });
    }
    if (game.difficulty < 3) {
      button(750, 750, 30, 30, ">", () => {
        game.difficulty++;
      });
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
  button(40, 30, 50, 30, Localisation.text("button.back"), () => {
    changeGameState("main-menu");
  });
}

function mainMenu() {
  push();
  background(colours.ui.background);
  fill(0, 100, 200);
  rect(400, 400, 800, 700);

  push();
  clip(() => {
    rect(400, 400, 800, 700);
  });

  noFill();
  stroke(0, 155, 255);

  for (let s = 0; s < 20; s++) {
    arc(
      400,
      400,
      ((700 + s * 10) * (3 + Math.sin(frameCount / 360 + s * 10))) / 4,
      ((600 + s * 10) * (3 + Math.sin(frameCount / 360 + s * 10))) / 4,
      Math.PI * Math.sin(frameCount / 60 + s * 10) + (Math.PI * s) / 10,
      Math.PI * Math.sin(frameCount / 60 + s * 10) +
        Math.PI * 0.3 * (Math.sin(frameCount / 80) + 1.4 + (Math.PI * s) / 10)
    );
  }
  pop();

  fill(220, 210, 170);
  rect(400, 400, 700, 600, 400);
  fill(0, 200, 30);
  rect(400, 400, 650, 550, 400);

  button(50, 30, 80, 30, Localisation.text("button.close"), () => {
    changeGameState("start-menu");
    commands.quit();
  });
  imageButton(
    650,
    200,
    232,
    120,
    images.buttons.play,
    () => {
      changeGameState("map-select");
    },
    true,
    false,
    false
  );
  hiddenTextImageButton(
    200,
    200,
    104,
    158,
    images.buttons.lang,
    "button.language-menu",
    () => {
      changeGameState("lang-selector");
    },
    true,
    false,
    false
  );
  push();
  fill(colours.ui.buttons.main);
  stroke(colours.ui.buttons.contrast);
  strokeWeight(3);
  textSize(50);
  modText("button.play", 650, 200, 100);
  pop();
  drawMoneyCounter(250, 30, false);
  textSize(25);
  fill(colours.ui.xp);
  noStroke();
  textAlign(LEFT, CENTER);
  text(
    Localisation.text("ui.xp.title") +
      " " +
      shorten(game.level) +
      " (" +
      shorten(game.xp) +
      "/" +
      shorten(game.toNextLevel) +
      ")",
    330,
    30
  );

  //Draw message stack
  let ypos = 775;
  textSize(20);
  for (let i = messages.length; i >= 0; i--) {
    let msg = messages[i];
    if (msg) {
      if (msg.time <= 0) {
        if (msg.opacity <= 0) {
          messages.splice(i, 1);
          i--;
          continue;
        } else {
          msg.opacity -= 5;
        }
      } else {
        msg.time--;
      }
      fill(...msg.colour, msg.opacity);
      noStroke();
      if (i === messages.length - 1)
        text("> " + msg.text + " (" + messages.length + ")", 20, ypos);
      else text("> " + msg.text, 20, ypos);
      ypos -= 25;
    }
  }
  pop();
}

function languageMenu() {
  push();
  background(colours.ui.background);
  fill(colours.ui.buttons.contrast);
  textSize(45);
  modText("menu.lang-selector.title", 400, 50, 800);
  fill(colours.ui.buttons.highlight);
  rect(400, 425, 800, 650);
  button(40, 30, 50, 30, Localisation.text("button.back"), () => {
    changeGameState("main-menu");
    newLang = Localisation.lang;
  });
  button(40, 70, 50, 30, Localisation.text("button.save"), () => {
    changeGameState("main-menu");
    message(Localisation.text("message.standard.langload"));
    updateLanguage(newLang).then(() => {
      message(Localisation.text("message.standard.langchange") + newLang);
    });
  });
  let ypos = 200;
  for (let l of Localisation.languages) {
    button(
      400,
      ypos,
      750,
      50,
      l.name,
      () => {
        newLang = l.short;
      },
      true,
      40
    );
    if (newLang === l.short) {
      noFill();
      stroke(colours.ui.accent);
      strokeWeight(6);
      rect(400, ypos, 750, 50);
    }
    ypos += 60;
  }
  pop();
}

function message(msg, type = "normal", time = 180) {
  const cols = {
    normal: [255, 255, 255],
    warn: [255, 255, 100],
    error: [255, 100, 100],
    debug: [0, 255, 200],
  };
  messages.push({
    text: msg,
    colour: cols[type] ?? cols.normal,
    time: time,
    opacity: 255,
  });
}

function showTitleAt(x, y) {
  noStroke();
  let txtPosCoefficient =
    ui.anims.startMenuIntro.progress / ui.anims.startMenuIntro.length;
  textSize(50 * txtPosCoefficient);
  fill(colours.title.monkey.main);
  stroke(colours.title.monkey.outline);
  strokeWeight(7);
  modText(
    "game.title.monkey",
    x - 90 * txtPosCoefficient,
    y + 4 + 110 * txtPosCoefficient
  );
  modText(
    "game.title.monkey",
    x - 90 * txtPosCoefficient,
    y + 2 + 110 * txtPosCoefficient
  );
  modText(
    "game.title.monkey",
    x - 90 * txtPosCoefficient,
    y + 110 * txtPosCoefficient
  );

  //to 330, 200
  textSize(50 * txtPosCoefficient);
  fill(colours.title.doom.main);
  stroke(colours.title.doom.outline);
  strokeWeight(7);
  modText(
    "game.title.doom",
    x + 110 * txtPosCoefficient,
    y + 4 + 110 * txtPosCoefficient
  );
  modText(
    "game.title.doom",
    x + 110 * txtPosCoefficient,
    y + 2 + 110 * txtPosCoefficient
  );
  modText(
    "game.title.doom",
    x + 110 * txtPosCoefficient,
    y + 110 * txtPosCoefficient
  );

  //to 490, 200
  textSize(120);
  fill(colours.title.bloons.main);
  stroke(colours.title.bloons.outline);
  strokeWeight(10);
  modText("game.title.bloons", x, y + 34);
  modText("game.title.bloons", x, y + 30);
  modText("game.title.bloons", x, y + 26);
  modText("game.title.bloons", x, y + 22);
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
  draw = true,
  maxTextSize = Infinity
) {
  push();
  if (draw) {
    rectMode(CENTER);
    stroke(...colours.ui.buttons.contrast);
    strokeWeight(5);
  }
  let hovered =
    smouse.x > x - width / 2 &&
    smouse.x < x + width / 2 &&
    smouse.y < y + height / 2 &&
    smouse.y > y - height / 2;
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
    let txt = Localisation.text(shownText);
    rect(x, y, width, height);
    textSize(30); //starting point for checks
    textSize(
      Math.min(maxTextSize, ((textSize() * width) / textWidth(txt)) * 0.8)
    );
    fill(...colours.ui.buttons.contrast);
    noStroke();
    textAlign(CENTER, CENTER);
    text(txt, x, y /*, width, height*/);
  }
  pop();
  return false;
}

/**
 * A button that shows an image instead of text. Otherwise identical to a button made with `button`.
 */
function imageButton(
  x = 0,
  y = 0,
  width = 30,
  height = 30,
  shownImage = error,
  onPress = () => {},
  draw = true,
  unavailable = false,
  outlines = true
) {
  push();
  if (draw) {
    rectMode(CENTER);
    stroke(...colours.ui.buttons.contrast);
    strokeWeight(5);
  }
  let hovered =
    smouse.x > x - width / 2 &&
    smouse.x < x + width / 2 &&
    smouse.y < y + height / 2 &&
    smouse.y > y - height / 2;
  if (hovered) {
    if (draw) {
      noFill();
      if (outlines) {
        rect(x, y, width, height);
        fill(...colours.ui.buttons.highlight);
      }
      tint(128);
    }
  } else {
    if (draw) {
      fill(...colours.ui.buttons.main);
    }
  }
  if (draw && unavailable) {
    tint(100, 0, 0);
  }
  if (mouseIsPressed && !waitingForKeyRelease) {
    if (hovered && !unavailable) {
      waitingForKeyRelease = true;
      onPress();
    }
  }

  if (draw) {
    if (outlines) rect(x, y, width, height);
    modImage(shownImage, x, y, width - 10, height - 10);
  }
  pop();
  return false;
}

/**
 * A button that shows an image instead of text, until hovered over, when it shows the text as well.
 */
function hiddenTextImageButton(
  x = 0,
  y = 0,
  width = 30,
  height = 30,
  shownImage = error,
  shownText = "",
  onPress = () => {},
  draw = true,
  unavailable = false,
  outlines = true
) {
  push();
  if (draw) {
    rectMode(CENTER);
    stroke(...colours.ui.buttons.contrast);
    strokeWeight(5);
  }
  let hovered =
    smouse.x > x - width / 2 &&
    smouse.x < x + width / 2 &&
    smouse.y < y + height / 2 &&
    smouse.y > y - height / 2;
  if (hovered) {
    if (draw) {
      noFill();
      if (outlines) {
        rect(x, y, width, height);
        fill(...colours.ui.buttons.highlight);
      }
      tint(128);
    }
  } else {
    if (draw) {
      fill(...colours.ui.buttons.main);
    }
  }
  if (draw && unavailable) {
    tint(100, 0, 0);
  }
  if (mouseIsPressed && !waitingForKeyRelease) {
    if (hovered && !unavailable) {
      waitingForKeyRelease = true;
      onPress();
    }
  }

  if (draw) {
    if (outlines) rect(x, y, width, height);
    modImage(shownImage, x, y, width - 10, height - 10);
    if (hovered) {
      push();
      let txt = Localisation.text(shownText);
      textSize(30); //starting point for checks
      textSize(((textSize() * width) / textWidth(txt)) * 0.8);
      fill(...colours.ui.buttons.contrast);
      noStroke();
      textAlign(CENTER, CENTER);
      text(txt, x, y);
      pop();
    }
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
  draw = true,
  unavailable = false
) {
  push();
  imageButton(x, y, width, height, shownImage, onPress, draw, unavailable);
  textSize(30); //starting point for checks
  let txt = Localisation.text(shownText);
  textSize(((textSize() * width) / textWidth(txt)) * 0.8);
  fill(...colours.ui.buttons.contrast);
  noStroke();
  textAlign(CENTER, CENTER);
  text(txt, x, y + textSize() * 1 + height / 2 /*, width, height*/);
  pop();
}

function mapButton(x, y, map) {
  push();
  captionedImageButton(
    x,
    y,
    200,
    200,
    images.maps[map.background],
    "map." + map.name + ".name",
    () => {
      game.map = map;
      loadCurrentRoundFrom(game.map);
      changeGameState("game");
      setTitleBarExtras(": " + Localisation.text("map." + map.name + ".name"));
      refreshWindowTitle();
    },
    true,
    !map.difficulties[game.difficulty],
    map.name
  );
  let off = 45;
  textSize(15);
  let extraInfo;
  if (map.difficulties[game.difficulty]) {
    extraInfo =
      Localisation.text("map.info.rounds") +
      ": " +
      (map.difficulties[game.difficulty].lastRound + 1) +
      " | " +
      Localisation.text("map.info.reward") +
      ": " +
      map.difficulties[game.difficulty].reward +
      "   ";
  } else {
    extraInfo = Localisation.text("map.info.unavailable");
  }
  text(extraInfo, x, y + off + 103);
  if (map.difficulties[game.difficulty])
    modImage(
      images.ui.bloon_gold,
      x + textWidth(extraInfo) / 2 + 1,
      y + off + 103,
      12,
      15
    );
  pop();
}

function drawInGameUI() {
  push();
  fill(0, 255, 255);
  noStroke();

  drawExtraInfo();
  //Moneys
  drawMoneyCounter();
  //XP and level
  drawXP();

  button(730, 770, 100, 40, "ui.shop.title", () => {
    ui.sidebar = "bloons-shop";
  });

  button(730, 720, 100, 40, "ui.bloons.title", () => {
    ui.sidebar = "bloons";
  });

  //draw sidebar
  drawSidebar();

  drawMonkeyHealthbar();

  pop();
}

function drawXP() {
  push();
  noFill();
  stroke(...colours.ui.accent);
  strokeWeight(5);
  rect(40, 40, 90, 90);
  fill(colours.ui.xp);
  stroke(255);
  textSize(20);
  let lvlTxt = shorten(game.level);
  textSize(Math.min(50, (textSize() * 100) / textWidth(lvlTxt)) * 0.8);
  textAlign(CENTER, CENTER);
  RADImage(images.ui.xp_bg, 40, 40, 90, 90, frameCount / 60);
  RADImage(images.ui.xp_bg, 40, 40, 90, 90, 0);
  text(lvlTxt, 40, 40);
  let xpTxt = shorten(game.xp) + "/"+shorten(game.toNextLevel);
  textSize(20);
  textSize(Math.min(20, (textSize() * 100) / textWidth(xpTxt)) * 0.8);
  text(xpTxt, 40, 80);
  pop();
}

function tickXPLevels() {
  if (game.xp > game.toNextLevel) {
    game.toNextLevel = Math.round(game.toNextLevel * 1.65);
    game.toNextLevel = Math.round(
      roundNum(game.toNextLevel, 2-(game.toNextLevel+"").length)
    );
    game.level++;
  }
}

function drawMoneyCounter(originX = 235, originY = 25, bg = true) {
  push();
  if (bg) {
    fill(...colours.ui.background, 150);
    stroke(...colours.ui.accent);
    strokeWeight(10);
    rect(originX, originY, 300, 60);
  }
  fill(colours.ui.cash);
  noStroke();
  textSize(20);
  textSize(
    Math.min(30, (textSize() * 100) / textWidth(game.inventory.cash)) * 0.8
  );
  textAlign(LEFT, CENTER);
  modImage(images.ui.coin, originX - 120, originY - 1, 40, 40);
  modText(game.inventory.cash, originX - 100, originY + 2);
  textSize(
    Math.min(30, (textSize() * 100) / textWidth(game.inventory.bloon_gold)) *
      0.8
  );
  textAlign(LEFT, CENTER);
  modImage(images.ui.bloon_gold, originX + 2, originY - 1, 32, 40);
  fill(colours.ui.bloon_gold);
  modText(game.inventory.bloon_gold, originX + 25, originY + 2);
  pop();
}

function drawExtraInfo() {
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
    text(
      roundNum(ui.currentFPS, 0) + " " + Localisation.text("util.fps.title"),
      5,
      112
    );
    pop();
  }
  //Mouse position
  {
    push();
    textAlign(LEFT, CENTER);
    fill(255);
    noStroke();
    textSize(15);
    modText(
      Localisation.text("util.mouse-pos.title") +
        ": " +
        roundNum(smouse.x, 0) +
        ", " +
        roundNum(smouse.y, 0),
      5,
      132
    );
    pop();
  }
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
    modText("ui.bloons.title", 725, 36);

    drawBloonSelector();

    bloonSendButton(
      700,
      100,
      ui.orderedBloonTypes[ui.selectedBloonType],
      prices.cash.bloons[ui.orderedBloonTypes[ui.selectedBloonType]]
    );
  }
  if (ui.sidebar === "bloons-shop") {
    stroke(255);
    strokeWeight(5);
    fill(0);
    textSize(30);
    modText("ui.shop.title", 725, 36);

    drawBloonSelector();

    bloonBuyButton(
      700,
      100,
      ui.orderedBloonTypes[ui.selectedBloonType],
      prices.cash.bloons[ui.orderedBloonTypes[ui.selectedBloonType]]
    );
  }
  pop();
}

function drawBloonSelector() {
  push();
  button(630, 140, 30, 30, "<", () => {
    if (ui.selectedBloonType > 0) ui.selectedBloonType--;
  });
  button(770, 140, 30, 30, ">", () => {
    if (ui.selectedBloonType < ui.orderedBloonTypes.length - 1)
      ui.selectedBloonType++;
  });
  noStroke();
  fill(colours.ui.buttons.contrast);
  textSize(5); //starting point for checks
  textSize(
    Math.min(
      30,
      ((textSize() * 100) /
        textWidth(
          Localisation.text(
            "bloon." + ui.orderedBloonTypes[ui.selectedBloonType] + ".name"
          )
        )) *
        0.8
    )
  );
  modText(
    "bloon." + ui.orderedBloonTypes[ui.selectedBloonType] + ".name",
    700,
    140,
    100
  );
  pop();
}

function bloonSendButton(x, y, bloon) {
  drawBloonInfoStuff(x, y, bloon);

  button(x + 40, y, 40, 30, "-->", () => {
    if (game.inventory.bloons[bloon + "s"] >= 1) {
      game.inventory.bloons[bloon + "s"]--;
      makeBloon(bloon);
    }
  });
}

function drawBloonInfoStuff(x, y, bloon) {
  push();
  let img = images.art[bloon] ?? images.bloons[bloon];
  if (!img) {
    console.error("Image not found for bloon '" + bloon + "'");
    img = noTextureError;
  }
  modImage(
    img,
    x - 70,
    y,
    Math.min(img.width / 2, 40),
    Math.min(img.height / 2, (40 * img.height) / img.width)
  );
  if (game.inventory.bloons[bloon + "s"] == null) {
    console.error("There is no slot in your inventory for '" + bloon + "'s");
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
    ((textSize() * 40) /
      textWidth("x" + shorten(game.inventory.bloons[bloon + "s"]))) *
      0.8
  );
  text("x" + shorten(game.inventory.bloons[bloon + "s"]), x - 20, y);
  pop();
}

function bloonBuyButton(x, y, bloon, price) {
  push();
  drawBloonInfoStuff(x, y, bloon);

  push();
  strokeWeight(5);
  stroke(colours.ui.buttons.contrast);
  fill(colours.ui.buttons.main);
  rect(x + 73, y, 40, 30);
  pop();

  noStroke();
  fill(colours.ui.buttons.contrast);

  textSize(5); //starting point for checks
  textSize(((textSize() * 40) / textWidth("x" + shorten(price))) * 0.8);
  text("$" + shorten(price), x + 73, y);

  button(x + 27, y, 30, 30, "+", () => {
    if (game.inventory.cash >= price) {
      game.inventory.cash -= price;
      game.inventory.bloons[bloon + "s"]++;
    }
  });
  pop();
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

function loadGameFrom(map) {
  game.map = map;
  game.round = 0;
  world.towers.splice(0, world.towers.length);
  loadCurrentRoundFrom(map);
  setTitleBarExtras(": " + map.displayName);
  refreshWindowTitle();
}

function loadCurrentRoundFrom(map) {
  world.towers.splice(0, world.towers.length);
  if (!map) return;
  if (!map.difficulties[game.difficulty].rounds) return;
  for (let tower of map.difficulties[game.difficulty].rounds[game.round]
    .towers) {
    let towerType = tower.type;
    if (towerType.split(":").length === 1) {
      towerType = towerType + ":0";
    }
    let towerClass = towerRegistry.get(towerType);
    let createdTower = new towerClass(world, tower.x, tower.y);
    createdTower.setTargetingPrio(tower.target ?? "first");
    createdTower.name = towerType.split(":")[0]
    if (tower.effect) {
      createVisualEffect(tower.effect, tower.x, tower.y);
    }
    world.towers.push(createdTower);
  }
  game.lives = map.difficulties[game.difficulty].rounds[game.round].lives;
}

function setTitleBarExtras(text) {
  document.getElementById("title-extras").innerText = "" + (text ?? "");
  document.getElementById("title-name").innerText =
    Localisation.text("game.title");
}

function refreshWindowTitle() {
  if (!Localisation.loaded) return;
  document.querySelector("title").innerText =
    game.state === "game"
      ? game.map?.name
        ? Localisation.text("map." + game.map.name + ".name") +
          " - " +
          Localisation.text("game.title")
        : ""
      : Localisation.text("game.title");
}

function setWindowTitle(txt) {
  document.querySelector("title").innerText = txt;
}

function createVisualEffect(effectName, x, y, direction) {
  if (!effectName) return;
  const effect = effectRegistry.get(effectName);
  if (!effect) return;
  effect.create(world, x, y, direction);
}

function drawMonkeyHealthbar() {
  push();
  textSize(10);
  stroke(0);
  strokeWeight(5);
  fill(0);
  rect(400, 770, 400, 20);
  rectMode(CORNER);
  fill(255, 0, 0);
  rect(
    200,
    760,
    400 *
      (game.lives /
        game.map.difficulties[game.difficulty].rounds[game.round].lives),
    20
  );
  textAlign(LEFT, CENTER);
  fill(255);
  strokeWeight(2);
  text(
    Localisation.text("ui.bar.lives") +
      ": " +
      game.lives +
      " / " +
      game.map.difficulties[game.difficulty].rounds[game.round].lives,
    220,
    770
  );
  textSize(20);
  textAlign(CENTER, CENTER);
  text(
    Localisation.text("ui.bar.round") +
      " " +
      (game.round + 1) +
      " " +
      Localisation.text("ui.bar.of") +
      " " +
      (game.map.difficulties[game.difficulty].lastRound + 1),
    400,
    747
  );
  pop();
}

function bloonDespawnEventTick() {
  if (timer(10)) {
    if (world.bloons.length > 0) {
      let bloonIndexToRemove = rnd(0, world.bloons.length);
      let bloon = world.bloons[bloonIndexToRemove];
      if (bloon) {
        if(world.particles.length < 1000) createVisualEffect("despawn", bloon.x, bloon.y, 0);//LIMIT THIS!!!
        game.inventory.bloon_gold ++
      }
      world.bloons.splice(bloonIndexToRemove, 1);
    } else {
      return true;
    }
  }
  return false;
}

function timer(frames) {
  return frameCount % frames === 0;
}

function changeGameState(state) {
  game.state = state;
  if (state !== "start-menu")
    setTitleBarExtras(": " + Localisation.text("state." + state + ".name"));
  else setTitleBarExtras("");
  refreshWindowTitle();
}

export { ui, game, mouse, camera, smouse };
export { draw, setup, preload, resize };
