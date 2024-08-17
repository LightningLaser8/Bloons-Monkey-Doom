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

statusRegistry.add("fire", {
  damage: 0.02,
  tickChance: 1,
  tick: function () {
    this.world.particles.push(
      new ShapeParticle(
        this.x,
        this.y,
        radians(rnd(0, 360)),
        90,
        0.5,
        0.0025,
        "circle",
        [255, 200, 40, 255],
        [255, 10, 10, 0],
        15,
        5,
        15,
        5
      )
    );
  },
})

statusRegistry.add("cold", {
  speedMult: 0.75,
  tickChance: 0.5,
  tick: function () {
    this.world.particles.push(
      new ShapeParticle(
        this.x + rnd(0, this.size),
        this.y + rnd(-this.size, this.size),
        radians(270),
        30,
        0.5,
        0,
        "circle",
        [220, 255, 255, 255],
        [220, 255, 255, 0],
        10,
        2,
        10,
        2
      )
    );
  }
})
  