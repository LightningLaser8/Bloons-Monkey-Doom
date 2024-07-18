class VisualEffect {
  create(world, x, y) {}
  /**
   * @param {Function} createFunction
   */
  constructor(createFunction) {
    this.create = createFunction;
  }
}
class ParticleEffect extends VisualEffect {
  constructor(
    count,
    direction,
    spread,
    lifetime,
    speed,
    decel,
    shape,
    colourFrom,
    colourTo,
    sizeXFrom,
    sizeXTo,
    sizeYFrom,
    sizeYTo,
    rotateSpeed
  ) {
    super(function (world, x, y) {
      for (let i = 0; i < count; i++) {
        world.particles.push(
          new ShapeParticle(
            x,
            y,
            direction + rnd(spread, -spread),
            lifetime,
            speed,
            decel,
            shape,
            colourFrom,
            colourTo,
            sizeXFrom,
            sizeXTo,
            sizeYFrom,
            sizeYTo,
            rotateSpeed
          )
        );
      }
    });
  }
}
class WaveParticleEffect extends VisualEffect {
  constructor(
    lifetime,
    fromRadius,
    toRadius,
    colourFrom,
    colourTo,
    strokeFrom,
    strokeTo
  ) {
    super(function (world, x, y) {
      world.particles.push(
        new WaveParticle(
          x,
          y,
          lifetime,
          fromRadius,
          toRadius,
          colourFrom,
          colourTo,
          strokeFrom,
          strokeTo
        )
      );
    });
  }
}
class MultiEffect extends VisualEffect {
  #effects = [];
  #byRef = false;
  /**
   * A package of multiple effects to create at once.
   * @param {Array} effects Array of effects to create.
   * @param {boolean} byRef Whether or not the `effects` Array contains references to the `effectRegistry`. If true, the effects will be looked up in the registry instead of directly created.
   */
  constructor(effects, byRef = false) {
    this.#effects = effects;
    this.#byRef = byRef;
  }
  create(world, x, y) {
    for (let e of this.#effects) {
      let effect = e;
      if (this.#byRef) {
        effect = effectRegistry.get(e);
      }
      e.create(world, x, y);
    }
  }
}

effectRegistry.add(
  "sniper_hit",
  new ParticleEffect(
    5,
    0,
    180,
    30,
    2,
    0.1,
    "rhombus",
    [255, 255, 0],
    [255, 255, 0, 0],
    50,
    50,
    20,
    0
  )
);
