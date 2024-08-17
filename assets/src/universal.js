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
    red: error,
    blue: error,
    green: error,
    yellow: error,
    pink: error,
    black: error,
    white: error,
    purple: error,
    zebra: error,
    lead: error,
    rainbow: error,
    ceramic: error,
  },
  art: {
    moab: error,
  },
  maps: {
    map1: error,
  },
  ui: {
    coin: error,
    bloon_gold: error,
    xp_bg: error,
  },
  // buttons: {
  //   play: error
  // }
};
/** Pricing for in-game purchasables */
const prices = {
  /** Pricing for anything costing cash. */
  cash: {
    bloons: {
      red: 1,
      blue: 3,
      green: 5,
      yellow: 8,
      pink: 15,
      white: 25,
      purple: 26,
      black: 25,
      zebra: 55,
      lead: 55,
      rainbow: 125,
      ceramic: 300,
    },
  },
  /** Pricing for anything costing the other currency. */
  bloon_gold: {},
};
/** Reward stuff */
const rewards = {
  /** XP rewards */
  xp: {
    /** General xp scoring:
     * - more speed => less xp
     * - immunity => 1 less xp per immunity
     * - more health => less xp
     * Overall, easier to leak => less XP earned.
     * These stats are per layer.
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
    },
  },
};

const names = {
  map_difficulties: ["Beginner", "Intermediate", "Advanced", "Expert", "Master"],
  game_difficulties: ["Easy", "Medium", "Hard", "Impossible"]
};

const title = {
  /** Localised names for the title bar extras. */
  extras: {
    "start-menu": "",
    "map-select": ": Map Selector",
    "game": ": In Game"
  }
}

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
