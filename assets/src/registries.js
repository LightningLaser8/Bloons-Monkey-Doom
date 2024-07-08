const effect_registry = {
  fire: {
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
  },
  cold: {
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
    },
  },
};
