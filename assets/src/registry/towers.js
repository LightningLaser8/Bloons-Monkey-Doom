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
  "test_sniper:2",
  class TestSniper extends Tower {
    constructor(world, x, y) {
      let bulletToAdd = {
        type: PointBullet,
        damage: 7,
        size: 10,
        drawer: new DrawShape("rect", [255, 0, 0], [255, 0, 0], 0, 4, 6),
        trailColour: [255, 0, 0],
        trailSize: 2,
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
