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
  /**
   * Visual effect to spawn particles at a location
   * @param {number} count Number of particles to spawn.
   * @param {boolean} useParentDirection If true, the `direction` property is an offset rather than an absolute direction.
   * @param {number} direction Direction (or offset) to spawn particles at.
   * @param {number} offset Offset in the direction of the particles (in degrees), before spread.
   * @param {number} spread Random amount (in degrees) to add to the direction. 90 means a 90 degree cone, or plus-or-minus 45 degrees.
   * @param {number} lifetime Number of frames until each particle despawns.
   * @param {number} speed Speed of each particle.
   * @param {number} decel Speed reduction per frame.
   * @param {string} shape Shape of the particle.
   * @param {Array<number>} colourFrom Colour the particle starts at.
   * @param {Array<number>} colourTo Colour the particle changes to.
   * @param {number} sizeXFrom Size in the X-direction the particle starts at.
   * @param {number} sizeXTo Size in the X-direction the particle changes to.
   * @param {number} sizeYFrom Size in the Y-direction the particle starts at.
   * @param {number} sizeYTo Size in the Y-direction the particle changes to.
   * @param {number} rotateSpeed Rotation in degrees per frame.
   */
  constructor(
    count,
    useParentDirection,
    direction,
    offset,
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
    super(function (world, x, y, inDirection) {
      let dir = useParentDirection ? inDirection + degToRad(direction) : direction;
      let offVct = angleToVector(dir).getScaledVector(offset);
      for (let i = 0; i < count; i++) {
        world.particles.push(
          new ShapeParticle(
            x + offVct.x,
            y + offVct.y,
            dir + degToRad(rnd(spread / 2, -spread / 2)),
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
    super(function (world, x, y, direction) {
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
class MultiEffect {
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
  create(world, x, y, direction) {
    for (let e of this.#effects) {
      let effect = e;
      if (this.#byRef) {
        effect = effectRegistry.get(e);
      }
      effect.create(world, x, y, direction);
    }
  }
}

effectRegistry.add(
  "sniper_hit",
  new ParticleEffect(
    5,
    false,
    0,
    0,
    360,
    30,
    2,
    0.1,
    "rhombus",
    [255, 255, 0],
    [255, 255, 0, 0],
    30,
    30,
    10,
    0
  )
);

effectRegistry.add(
  "sniper_fire",
  new ParticleEffect(
    1,
    true,
    0,
    20,
    0,
    10,
    0,
    0,
    "rhombus",
    [255, 255, 0],
    [255, 255, 0, 0],
    50,
    50,
    20,
    0
  )
);

effectRegistry.add(
  "upgrade",
  new MultiEffect([
    new ParticleEffect(
      5,
      false,
      0,
      0,
      360,
      30,
      3,
      0,
      "rhombus",
      [255, 255, 100],
      [200, 200, 200, 0],
      30,
      30,
      10,
      0,
      2
    ),
    new WaveParticleEffect(
      20,
      0,
      80,
      [255, 255, 255],
      [200, 200, 200, 0],
      5,
      1
    ),
    new WaveParticleEffect(
      40,
      0,
      100,
      [255, 255, 255],
      [200, 200, 200, 0],
      6,
      2
    )
  ])
);

effectRegistry.add(
  "place",
  new MultiEffect([
    new ParticleEffect(
      5,
      false,
      0,
      0,
      360,
      30,
      3,
      0,
      "rhombus",
      [255, 255, 255],
      [200, 200, 200, 0],
      30,
      30,
      10,
      0,
      0
    ),
    new WaveParticleEffect(
      20,
      0,
      80,
      [255, 255, 255],
      [200, 200, 200, 0],
      5,
      1
    )
  ])
);

effectRegistry.add(
  "despawn",
  new MultiEffect([
    new ParticleEffect(
      10,
      false,
      0,
      0,
      360,
      30,
      2,
      0,
      "rhombus",
      colours.ui.xp,
      colours.ui.xp,
      20,
      20,
      10,
      0,
      0
    ),
    new WaveParticleEffect(
      20,
      0,
      30,
      colours.ui.xp,
      colours.ui.xp,
      5,
      1
    )
  ])
);