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

towerRegistry.add(
  "test_tower:0",
  class TestTower extends Tower {
    constructor(world, x, y) {
      let bulletToAdd = {
        type: Bullet,
        damage: 1,
        size: 10,
        drawer: new DrawShape("rect", [255, 0, 0], [255, 0, 0], 0, 4, 6),
        speed: 15,
        lifetime: 7,
        trailColour: [255, 0, 0],
        trailSize: 2,
      };
      super(
        world,
        x,
        y,
        new DrawShape("rect", [255, 0, 0], [0, 0, 0], 3, 10, 20),
        bulletToAdd,
        30,
        100,
        10
      );
      this.displayName = "Test Tower";
    }
  }
);
towerRegistry.add(
  "test_sniper:0",
  class TestSniper extends Tower {
    constructor(world, x, y) {
      let bulletToAdd = {
        type: PointBullet,
        damage: 2,
        size: 10,
        drawer: new DrawShape("rect", [255, 0, 0], [255, 0, 0], 0, 4, 6),
        hitEffect: "sniper_hit",
        shootEffect: "sniper_fire",
      };
      super(
        world,
        x,
        y,
        new DrawShape("rect", [255, 0, 0], [0, 0, 0], 3, 10, 20),
        bulletToAdd,
        90,
        20,
        10
      );
      this.displayName = "Test Sniper";
      this.tier = 0;
      this.global = true;
    }
  }
);
towerRegistry.add(
  "test_sniper:1",
  class TestSniper extends Tower {
    constructor(world, x, y) {
      let bulletToAdd = {
        type: PointBullet,
        damage: 4,
        size: 10,
        drawer: new DrawShape("rect", [255, 0, 0], [255, 0, 0], 0, 4, 6),
        hitEffect: "sniper_hit",
        shootEffect: "sniper_fire",
      };
      super(
        world,
        x,
        y,
        new DrawShape("rect", [255, 0, 0], [0, 0, 0], 3, 10, 20),
        bulletToAdd,
        90,
        20,
        10
      );
      this.displayName = "Test Sniper";
      this.tier = 1;
      this.global = true;
    }
  }
);
towerRegistry.add(
  "test_sniper:2",
  class TestSniper extends Tower {
    constructor(world, x, y) {
      let bulletToAdd = {
        type: PointBullet,
        damage: 7,
        size: 10,
        drawer: new DrawShape("rect", [255, 0, 0], [255, 0, 0], 0, 4, 6),
        hitEffect: "sniper_hit",
        shootEffect: "sniper_fire",
      };
      super(
        world,
        x,
        y,
        new DrawShape("rect", [255, 0, 0], [0, 0, 0], 3, 10, 20),
        bulletToAdd,
        90,
        20,
        10
      );
      this.displayName = "Test Sniper";
      this.tier = 2;
      this.global = true;
    }
  }
);
