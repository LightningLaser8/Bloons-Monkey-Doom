import { ImageContainer } from "./geometry.js";
import { ui } from "./game.js";
import { cyrb53 } from "./number.js";
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

//Universal constants that won't change, except maybe on preload.

/** Contains colour presets to be used in the game
 * Use like: `background(...colour.ui.accent)`
 * or: trailColour: `colour.bloons.red`
 */
const colours = {
  /** Colours relating to user interface */
  ui: {
    /** Accent colour for emphasised elements */
    accent: [255, 128, 0, 255],
    /** Colour for anything money-related */
    cash: [255, 220, 0, 255],
    /** Colour for anythinh bloon gold-related */
    bloon_gold: [255, 220, 0, 255],
    /** Colour for anything XP-related */
    xp: [200, 110, 255, 255],

    buttons: {
      main: [0, 0, 0],
      contrast: [255, 255, 255],
      highlight: [50, 50, 50],
    },

    background: [0, 0, 0],
  },
  /** Colours of bloon types */
  bloons: {
    red: [255, 50, 50, 255],
    blue: [100, 150, 255, 255],
    green: [80, 200, 70, 255],
    yellow: [255, 240, 75, 255],
    pink: [255, 130, 130, 255],
    black: [21, 21, 21, 255],
    white: [240, 240, 240, 255],
    lead: [130, 130, 130, 255],
    purple: [155, 55, 225, 255],
    //no (proper) zebra or rainbow, as they are multi-colour
    zebra: [130, 130, 130, 255],
    rainbow: [255, 128, 0, 255], //actually the same as the accent
    ceramic: [190, 120, 50, 255],
    //Blimp moment
    moab: [100, 150, 255, 255],
    bfb: [255, 50, 50, 255],
    zomg: [21, 21, 21, 255],
    ddt: [130, 130, 130, 255],
    bad: [155, 55, 225, 255],
  },
  /** Colours of the title screen */
  title: {
    background: [255, 128, 0, 255],
    bloons: {
      main: [0, 200, 255],
      outline: [0, 100, 128],
    },
    monkey: {
      main: [150, 100, 50],
      outline: [100, 50, 0],
    },
    doom: {
      main: [255, 50, 50],
      outline: [200, 0, 0],
    },
  },
};
let error = {};
const images = {
  bloons: {
    red: new ImageContainer("assets/textures/bloons/red.png"),
    blue: new ImageContainer("assets/textures/bloons/blue.png"),
    green: new ImageContainer("assets/textures/bloons/green.png"),
    yellow: new ImageContainer("assets/textures/bloons/yellow.png"),
    pink: new ImageContainer("assets/textures/bloons/pink.png"),
    black: new ImageContainer("assets/textures/bloons/black.png"),
    white: new ImageContainer("assets/textures/bloons/white.png"),
    purple: new ImageContainer("assets/textures/bloons/purple.png"),
    zebra: new ImageContainer("assets/textures/bloons/zebra.png"),
    lead: new ImageContainer("assets/textures/bloons/lead.png"),
    rainbow: new ImageContainer("assets/textures/bloons/rainbow.png"),
    ceramic: new ImageContainer("assets/textures/bloons/ceramic.png"),
    moab: new ImageContainer("assets/textures/bloons/moab.png"),
    bfb: new ImageContainer("assets/textures/bloons/bfb.png"),
    zomg: new ImageContainer("assets/textures/bloons/zomg.png"),
    ddt: new ImageContainer("assets/textures/bloons/ddt.png"),
    bad: new ImageContainer("assets/textures/bloons/bad.png"),
  },
  art: {
    moab: new ImageContainer("assets/textures/art/moab.png"),
    bfb: new ImageContainer("assets/textures/art/bfb.png"),
    zomg: new ImageContainer("assets/textures/art/zomg.png"),
    ddt: new ImageContainer("assets/textures/art/ddt.png"),
    bad: new ImageContainer("assets/textures/art/bad.png"),
  },
  maps: {
    map1: new ImageContainer("assets/textures/maps/map1.png"),
  },
  ui: {
    coin: new ImageContainer("assets/textures/ui/coin.png"),
    bloon_gold: new ImageContainer("assets/textures/ui/bloon_gold.png"),
    xp_bg: new ImageContainer("assets/textures/ui/xp_bg.png"),
  },
  buttons: {
    play: new ImageContainer("assets/textures/buttons/play.png"),
    lang: new ImageContainer("assets/textures/buttons/lang.png")
  }
};
/** Pricing for in-game purchasables */
const prices = {
  /** Pricing for anything costing cash. */
  cash: {
    bloons: {
      red: 1,
      blue: 3,
      green: 4,
      yellow: 6,
      pink: 10,
      white: 15,
      purple: 18,
      black: 15,
      zebra: 20,
      lead: 25,
      rainbow: 50,
      ceramic: 100,
      moab: 600,
      bfb: 2500,
      zomg: 5200,
      ddt: 3500,
      bad: 12000
    },
  },
  /** Pricing for anything costing bloon gold. */
  bloon_gold: {},
  /** XP costs for unlocking things. */
  xp: {
    /** XP costs for unlocking bloon types in a game. */
    bloons: {
      red: 0,
      blue: 100,
      green: 200,
      yellow: 500,
      pink: 1000,
      white: 2500,
      purple: 3000,
      black: 2500,
      zebra: 7500,
      lead: 10000,
      rainbow: 20000,
      ceramic: 50000,
      moab: 100000,
      bfb: 350000,
      zomg: 500000,
      ddt: 200000,
      bad: 1000000
    }
  }
};
/** Reward stuff */
const rewards = {
  /** XP rewards */
  xp: {
    /** General xp scoring:
     * - more speed => less xp
     * - immunity => 1 less xp per immunity
     * - more health => less xp  
     * 
     * Overall, easier to leak => less XP earned.
     * These stats are per layer, so higher layers should give fewer XP points.
     */
    bloons: {
      red: 5,
      blue: 4,
      green: 3,
      yellow: 2,
      pink: 1,
      black: 2,
      white: 2,
      purple: 1,
      zebra: 1,
      lead: 1,
      rainbow: 2,
      ceramic: 1,
      moab: 1,
      bfb: 1,
      zomg: 1,
      ddt: 1,
      bad: 1
    },
  },
};

class Localisation {
  static directory = {};
  static loaded = false;
  static lang = "none";
  static languages = [
    {name: "English (GB)", short: "en-gb"},
    {name: "ASCII", short: "en-gb-binary"},
    {name: "Hexadecimal", short: "en-gb-hex"},
    {name: "(BG) hsilgnE", short: "en-gb-reversed"},
  ]
  constructor() {
    throw new TypeError("Cannot instantiate Localisation");
  }
  static text(name) {
    name = name.toString().toLowerCase().trim();
    return ""+(this.directory[name] ?? name ?? this.directory["error.null-text"] ?? "error.null-text");
  }
  static async setup(language = "en-gb") {
    this.directory = {};
    this.loaded = false;
    let initLang = language;
    let parts = language.split("-")
    language = language.replaceAll("-reversed", "").replaceAll("-binary", "").replaceAll("-hex", "")
    const file = await import("../localisation/" + language + ".json", {
      with: { type: "json" },
    });
    if (!file) {
      throw new Error("Localisation file not found!");
    }
    let obj = file.default;
    if (!obj) {
      throw new Error("Localisation file empty!");
    }
    if (Array.isArray(obj)) {
      throw new Error("Invalid localisation file!");
    }
    for (let item of Object.keys(obj)) {
      if (typeof obj[item] !== "string") {
        throw new Error(
          "Invalid localisation entry: '" + item + ": " + obj[item] + "'"
        );
      }
      let toAdd = obj[item]
      if(parts.includes("reversed")) toAdd = Array.from(toAdd).reverse().join("");
      if(parts.includes("binary")) toAdd = Array.from(toAdd).map(x => x.charCodeAt(0).toString(2)).join(" ")
      if(parts.includes("hex")) toAdd = Array.from(toAdd).map(x => x.charCodeAt(0).toString(16)).map(x => x==="20"?" ":x).join("")
      
      this.directory[item] = toAdd;
    }
    console.log("Game language is "+initLang+".")
    this.lang = initLang;
    this.loaded = true;
  }
}

function modText(txt, txt_x, txt_y, txt_maxwidth) {
  text(Localisation.text(txt), txt_x, txt_y, txt_maxwidth);
}

const names = {
  map_difficulties: [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
    "master",
  ],
  game_difficulties: ["easy", "medium", "hard", "impossible"],
};

const title = {
  /** Localised names for the title bar extras. */
  extras: {
    "start-menu": "",
    "map-select": ": " + Localisation.text("state.map-selector.name"),
    game: ": " + Localisation.text("state.in-game.name"),
  },
};

function setupAnimations() {
  ui.anims = {
    startMenuIntro: {
      length: 30,
      progress: 0,
      parts: [
        {
          image: images.bloons.red,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: 10,
          deltaY: 5,
          deltaRot: 1,
          deltaScale: 0.075,
        },
        {
          image: images.bloons.blue,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: -5,
          deltaY: -2,
          deltaRot: -0.5,
          deltaScale: 0.065,
          flip: true,
        },
        {
          image: images.bloons.green,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: -8,
          deltaY: 4,
          deltaRot: 1,
          deltaScale: 0.075,
          flip: true,
        },
        {
          image: images.bloons.yellow,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: 3,
          deltaY: -4,
          deltaRot: -1,
          deltaScale: 0.075,
        },
        {
          image: images.art.moab,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: 0.1,
          deltaY: 4,
          deltaRot: 1,
          deltaScale: 0.075,
        },
        {
          image: images.bloons.pink,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: 9,
          deltaY: -6,
          deltaRot: -0.5,
          deltaScale: 0.075,
        },
        {
          image: images.bloons.black,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: -8,
          deltaY: -7,
          deltaRot: -0.7,
          deltaScale: 0.075,
          flip: true,
        },
        {
          image: images.bloons.white,
          x: 400,
          y: 400,
          rot: 0,
          scale: 1,
          deltaX: -10,
          deltaY: -3,
          deltaRot: -0.3,
          deltaScale: 0.075,
          flip: true,
        },
      ],
    },
  };
}
export {
  setupAnimations,
  colours,
  images,
  prices,
  rewards,
  names,
  title,
  Localisation,
  modText,
};


