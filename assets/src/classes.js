class ScreenShakeInstance {
  constructor(x, y, intensity, duration) {
    this.x = x;
    this.y = y;
    this.intensity = intensity;
    this.duration = duration;
    this.maxIntensity = intensity;
    this.maxDuration = duration;
  }
}

function shake(x, y, intensity, duration) {
  if (intensity != null && duration != null) {
    world.shakes.push(new ScreenShakeInstance(x, y, intensity, duration));
  }
}

class DrawerParticle {
  constructor(x, y, direction, lifetime, speed, drawer, decel) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.lifetime = lifetime;
    this.maxLife = lifetime;
    this.speed = speed;
    this.drawer = drawer;
    this.remove = false;
    if (decel != null) {
      this.decel = decel;
    } else {
      this.decel = 0;
    }
  }
  step(dt) {
    if (this.lifetime >= dt) {
      this.moveTo(
        this.x + this.speed * angleToVector(this.direction).x * dt,
        this.y + this.speed * angleToVector(this.direction).y * dt
      );
      this.lifetime -= dt;
      if (this.speed >= this.decel) {
        this.speed -= this.decel;
      } else {
        this.speed = 0;
      }
    } else {
      this.remove = true;
    }
  }
  show() {
    if (this.drawer != null) {
      this.drawer.rotDraw(this.x, this.y, this.direction);
    } else {
      errorDrawer.draw(this.x, this.y);
    }
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}

class WaveParticle {
  constructor(
    x,
    y,
    lifetime,
    fromRadius,
    toRadius,
    colourFrom,
    colourTo,
    strokeFrom,
    strokeTo
  ) {
    this.x = x;
    this.y = y;
    this.lifetime = lifetime;
    this.fromRadius = fromRadius;
    this.toRadius = toRadius;
    this.radius = fromRadius;
    this.remove = false;
    this.colourFrom = colourFrom;
    this.colourTo = colourTo;
    this.maxLifetime = lifetime;
    this.strokeFrom = strokeFrom;
    this.strokeTo = strokeTo;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      this.radius =
        this.fromRadius * this.calcLifeFract() +
        this.toRadius * (1 - this.calcLifeFract());
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  show(context = globalThis) {
    context.push();
    context.noFill();
    context.stroke(
      blendColours(this.colourFrom, this.colourTo, this.calcLifeFract())
    );
    context.strokeWeight(
      this.strokeFrom * this.calcLifeFract() +
        this.strokeTo * (1 - this.calcLifeFract())
    );
    context.circle(this.x, this.y, this.radius * 2);
    context.pop();
  }
}

class ShapeParticle {
  #rotOffset;
  constructor(
    x,
    y,
    direction,
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
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.lifetime = lifetime;
    this.decel = decel;
    this.shape = shape;
    this.remove = false;
    this.colourFrom = colourFrom;
    this.colourTo = colourTo;
    this.maxLifetime = lifetime;
    this.sizeXFrom = sizeXFrom;
    this.sizeXTo = sizeXTo;
    this.sizeX = sizeXFrom;
    this.sizeYFrom = sizeYFrom;
    this.sizeYTo = sizeYTo;
    this.sizeY = sizeYFrom;
    this.rotateSpeed = rotateSpeed;
    this.#rotOffset = 0;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      this.sizeX =
        this.sizeXFrom * this.calcLifeFract() +
        this.sizeXTo * (1 - this.calcLifeFract());
      this.sizeY =
        this.sizeYFrom * this.calcLifeFract() +
        this.sizeYTo * (1 - this.calcLifeFract());
      this.moveTo(
        this.x + this.speed * angleToVector(this.direction).x * dt,
        this.y + this.speed * angleToVector(this.direction).y * dt
      );
      this.lifetime -= dt;
      if (this.speed >= this.decel) {
        this.speed -= this.decel;
      } else {
        this.speed = 0;
      }
      if (this.rotateSpeed) {
        this.#rotOffset += this.rotateSpeed;
      }
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  show(context = globalThis) {
    context.push();
    context.noStroke();
    context.fill(255);
    context.fill(
      blendColours(this.colourFrom, this.colourTo, this.calcLifeFract())
    );
    RADShape(
      this.shape,
      this.x,
      this.y,
      this.sizeX,
      this.sizeY,
      this.direction + this.#rotOffset,
      context
    );
    context.pop();
  }
}

class TextParticle extends DrawerParticle {
  constructor(x, y, direction, lifetime, speed, text, size, colour, decel) {
    super(x, y, direction, lifetime, speed, null, decel);
    this.text = text;
    this.size = size;
    this.colour = colour;
    if (this.colour[3] == null) {
      this.colour[3] = 255;
    }
    this.remove = false;
  }
  show() {
    push();
    fill(this.colour[0], this.colour[1], this.colour[2], this.colour[3]);
    noStroke();
    text(this.text, this.x - this.size / 2, this.y - this.size / 2);
    pop();
  }
}

class Bullet {
  #trailCounter;
  #intervalCounter;
  constructor() {
    //Basic
    this.damage = 0;
    this.speed = 0;
    this.lifetime = 0;
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.drawer = null;
    this.size = 1;
    this.inaccuracy = 0;
    this.pierce = 0;
    this.isCrit = false;
    //Frag
    this.fragBullet = null;
    this.fragSpread = 0;
    this.fragNumber = 0;
    //Explosions
    this.splashDamage = 0;
    this.splashRadius = 0;
    this.splashEffect = true;
    this.splashShake = true;
    //Status
    this.status = "null";
    this.statusDuration = 0;
    this.statusStacks = 1;
    //Trails
    this.trailColour = [255, 220, 180, 255];
    this.hasTrail = true;
    this.trailSize = null;
    //Interval
    this.intervalBullet = null;
    this.intervalSpread = 0;
    this.intervalAngle = 0;
    this.intervalNumber = 0;
    this.intervalSpacing = 1;
    this.intervalRegularSpread = 0;
    this.intervalOffset = 0;
    //Tracking, i guess
    this.trackingType = "nope";
    this.tracking = false;
    this.trackingRange = Infinity;

    //Advanced
    this.collides = true;
    this.targetArray = "entities"; //Tracking
    this.trailInterval = 1; //Trails

    //Internal
    this.remove = false;
    this.iframes = 0;
    this.trails = [];
    this.#trailCounter = 0;
    this.pierced = [];
    this.#intervalCounter = 0;
    this.maxLife = 0;
    this.attributableEntity = null;
    this.directedAt = null;
  }
  init() {
    this.direction =
      this.direction + radians(rndScl(-this.inaccuracy, this.inaccuracy, 5));
    this.maxLife = this.lifetime;
    this.onCreate();
  }
  applyStatusesTo(entity) {
    for (let i = 0; i < this.statusStacks; i++) {
      if (this.status != "null" && this.statusDuration) {
        entity.addStatus({
          effect: this.status,
          time: this.statusDuration,
          source: this.attributableEntity,
        });
      }
    }
  }
  move(dt) {
    this.moveTo(
      this.x + dt * angleToVector(this.direction).x,
      this.y + dt * angleToVector(this.direction).y
    );
  }
  step(dt, world) {
    if (this.lifetime >= dt) {
      for (let i = 0; i < dt; i++) {
        this.trackingTick();
        this.move(this.speed);
        for (let e = 0; e < this.speed; e++) {
          if (this.#trailCounter <= 0) {
            if (
              this?.attributableEntity?.world?.particles != null &&
              this.hasTrail
            ) {
              this.attributableEntity.world.particles.push(
                new ShapeParticle(
                  this.x - e * angleToVector(this.direction).x,
                  this.y - e * angleToVector(this.direction).y,
                  this.direction,
                  this.maxLife * 1.2,
                  0,
                  0,
                  "circle",
                  this.trailColour,
                  this.trailColour,
                  (this.trailSize ?? this.size) * 1.9,
                  0,
                  (this.trailSize ?? this.size) * 1.9,
                  0
                )
              );
            }
            this.#trailCounter = this.trailInterval;
          } else {
            this.#trailCounter--;
          }
        }
      }
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
    if (this.isCrit) {
      let p = new Particle(
        this.x,
        this.y,
        this.direction,
        999,
        10,
        new DrawImage(sparkTexture, 6, 10),
        0.2
      );
      p.step(1, particleArray);
      p.speed = rnd(5, 8);
      p.lifetime = rnd(7, 11);
      p.direction += radians(rnd(-15, 15));
      p.direction += radians(180);
      particleArray.push(p);
    }
    this.onTick();
  }
  trackingTick() {
    if (this.tracking) {
      let minDist = Infinity;
      let target = world[this.targetArray];
      let selected = null;
      for (let i of target) {
        let iDist = Math.sqrt((this.x - i.x) ** 2 + (this.y - i.y) ** 2);
        if (
          iDist < minDist &&
          i != this.attributableEntity &&
          i != this &&
          iDist < this.trackingRange
        ) {
          minDist = iDist;
          selected = i;
        }
      }
      if (this.trackingType == "instant") {
        if (selected != null) {
          let here = new Vector(this.x, this.y);
          let pos = new Vector(selected.x, selected.y);
          let targetRotation = pos.subtract(here).getAngle() + HALF_PI;
          this.direction = targetRotation;
        }
      }
    }
  }
  frag() {
    if (this.fragBullet != null) {
      let lower = Math.floor(0 - this.fragSpread);
      let upper = Math.floor(this.fragSpread);
      let b = bullet(this.fragBullet);
      b.x = this.x;
      b.y = this.y;
      b.direction = this.direction;
      b.inaccuracy += rnd(lower, upper);
      b.attributableEntity = this.attributableEntity;
      b.init();
      b.step(2);
      return b;
    }
  }
  interval() {
    if (this.intervalBullet != null) {
      if (this.#intervalCounter >= this.intervalSpacing) {
        this.#intervalCounter = 0;
        let bs = [];
        let totalAngle = this.intervalRegularSpread * (this.intervalNumber - 1);
        let startAngle = -(totalAngle / 2);
        for (let ic = 0; ic < this.intervalNumber; ic++) {
          let angle = startAngle + this.intervalRegularSpread * ic;
          let lower = Math.floor(0 - this.intervalSpread);
          let upper = Math.floor(this.intervalSpread);
          let b = bullet(this.intervalBullet);
          b.x = this.x;
          b.y = this.y;
          b.direction = this.direction + radians(this.intervalAngle + angle);
          b.inaccuracy += rnd(lower, upper);
          b.attributableEntity = this.attributableEntity;
          b.init();
          b.move(this.intervalOffset);
          bs.push(b);
        }
        return bs;
      } else {
        this.#intervalCounter++;
      }
    }
  }
  collidesWith(e) {
    return (
      (this.getPos().distanceTo(e.getPos()) < e.size + this.size ||
        this.laserCollide(e)) &&
      this.attributableEntity &&
      this.attributableEntity != e &&
      this.collides &&
      !this.remove
    );
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  show() {
    for (let t of this.trails) {
      fill(255, 220, 180);
      noStroke();
      circle(t.x, t.y, t.r);
      t.r -= 10 / this.maxLife;
    }
    if (this.remove == false) {
      if (this.drawer != null) {
        this.drawer.rotDraw(this.x, this.y, this.direction);
      } else {
        errorDrawer.draw(this.x, this.y);
      }
    }
  }
  getPos() {
    return new Vector(this.x, this.y);
  }
  laserCollide(obj) {
    return false;
  }
  //Customisation
  onRemove() {} //called when bullet despawns. Called after damage, and sometimes without it.
  onTick() {} //called every tick.
  onCreate() {} //called when made, on initialisation.
  onHit(entityHit, hitX, hitY) {} //called when bullet hits something. Called before damage.
}

class SkyBullet extends Bullet {
  #maxSize;
  #minSize;
  #maxDistance;
  #currentDistance;
  constructor() {
    super();
    this.collides = false;
    this.#maxSize = 0;
    this.#minSize = 0;
    this.#maxDistance = 0;
    this.maxSize = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.xInaccuracy = 0;
  }
  init() {
    this.#minSize = this.size;
    this.#maxSize = this.maxSize;
    this.targetY = this.y;
    this.targetX = this.x;
    this.y -= 600;
    this.x += rnd(-this.xInaccuracy, this.xInaccuracy);
    super.init();

    let targetVector = new Vector(this.targetX, this.targetY);
    let hereVector = new Vector(this.x, this.y);
    this.direction = targetVector.subtract(hereVector).getAngle() + HALF_PI;
    this.#maxDistance = targetVector.distanceTo(hereVector);
    this.#currentDistance = this.#maxDistance;
  }
  step(dt) {
    let targetVector = new Vector(this.targetX, this.targetY);
    let hereVector = new Vector(this.x, this.y);
    this.direction = targetVector.subtract(hereVector).getAngle() + HALF_PI;
    this.#currentDistance = targetVector.distanceTo(hereVector);
    let fraction = this.#currentDistance / this.#maxDistance;
    this.size = this.#minSize * (1 - fraction) + this.#maxSize * fraction;
    super.step(dt);
    if (this.#currentDistance < this.speed) {
      this.remove = true;
    }
  }
  show() {
    if (this.remove == false) {
      push();
      //translate(-this.x, -this.y)
      let scaleFactor = this.#currentDistance / this.#maxDistance + 1;
      //scale(1/scaleFactor)
      //translate(this.x * scaleFactor, this.y * scaleFactor)
      if (this.drawer != null) {
        this.drawer.options.scale = scaleFactor;
        this.drawer.rotDraw(this.x, this.y, this.direction);
      } else {
        errorDrawer.draw(this.x, this.y);
      }
      pop();
    }
  }
}

class LaserBullet extends Bullet {
  constructor() {
    super();
    this.currentLength = -1;
    this.currentSize = 0;
    this.length = 0;
    this.originalDamage = 0;
  }
  init() {
    this.direction =
      this.direction + radians(rnd(-this.inaccuracy, this.inaccuracy));
    this.maxLife = this.lifetime;
    this.originalDamage = this.damage;
    this.currentSize = this.size;
  }
  laserCollide(obj) {
    let vct = new Vector(
      Math.cos(this.direction - HALF_PI),
      Math.sin(this.direction - HALF_PI)
    );
    let here = new Vector(this.x, this.y);
    for (let i = 0; i < this.currentLength; i++) {
      let check = here.add(vct.getScaledVector(i));
      if (check.distanceTo(obj.getPos()) <= this.size + obj.size) {
        return true;
      }
    }
    return false;
  }
  show() {
    if (this.remove == false) {
      let offset = angleToVector(this.direction).getScaledVector(
        this.currentLength / 2
      );
      if (this.drawer != null) {
        this.drawer.rotDraw(
          this.x + offset.x,
          this.y + offset.y,
          this.direction
        );
      } else {
        errorDrawer.draw(this.x + offset.x, this.y + offset.y);
      }
    }
  }
  step(dt) {
    super.step(dt);
    for (let i = 0; i < dt; i++) {
      if (this.currentLength < this.length) {
        this.currentLength += (this.length / this.maxLife) * 3;
      } else {
        this.currentSize -= this.size / this.maxLife;
      }
    }
    if (this.drawer != null) {
      this.drawer.sizeY = this.currentLength;
      this.drawer.sizeX = this.currentSize * 2;
    }
    this.damage = Math.round(
      this.originalDamage *
        ((this.currentSize / this.size +
          (this.length - this.currentLength) / this.length) /
          2)
    );
  }
  noResizeStep(dt) {
    super.step(dt);
  }
}

class ContinuousLaserBullet extends LaserBullet {
  step(dt) {
    super.noResizeStep(dt);
    for (let i = 0; i < dt; i++) {
      if (this.lifetime > this.maxLife - this.spawnTime) {
        this.currentLength += this.length / this.spawnTime;
      } else if (this.lifetime < this.despawnTime) {
        this.currentSize -= this.size / this.despawnTime;
      }
    }
    if (this.drawer != null) {
      this.drawer.sizeY = this.currentLength;
      this.drawer.sizeX = this.currentSize * 2;
    }
    //this.damage = Math.round(this.originalDamage * (((this.currentSize / this.size) + ((this.length - this.currentLength) / this.length)) / 2))

    this.pierced = [];
  }
}

class PointBullet extends Bullet {
  step() {}
  init() {
    super.init();
    this.speed = 0;
    this.lifetime = 1;
    this.hasTrail = false;
    if(this.directedAt){
      this.x = this.directedAt.x;
      this.y = this.directedAt.y;
    }
  }
  collidesWith(e) {
    return e === this.directedAt;
  }
}

function makeBulletFrom(object, attributableEntity) {
  let b = new object.type();
  b = Object.assign(b, object);
  b.attributableEntity = attributableEntity;
  if (attributableEntity) {
    b.damage *= attributableEntity.damageMultiplier;
  }
  b.init();
  return b;
}
let bullet = makeBulletFrom;
function makeBulletsFrom(attributableEntity, ...objects) {
  let bullets = [];
  for (let a of objects) {
    bullets.push(makeBulletFrom(a, attributableEntity));
  }
  return bullets;
}
let bullets = makeBulletsFrom;
/*pass in object(s):
{
  type: {type object: LaserBullet or Bullet},
  damage: 0,
  length: 0,
  lifetime: 0,
  x: 0,
  y: 0,
  direction: 0,
  drawer: {drawer object},
  size: 0,
  fragBullet: {another object like this one},
  fragSpread: 0,
  fragNumber: 0,
  inaccuracy: 0,
  pierce: 0,
  splashDamage: 0,
  splashRadius: 0
  ...etc
}
*/

class Entity {
  statuses = [];
  isPlayer = false;
  removed = false;
  #hpMultiplier = 1;
  damageMultiplier = 1;
  #speedMultiplier = 1;
  dead = false;
  dynamicVelocity = { speed: 0, direction: 0 };
  #previousPos = new Vector(0, 0);
  target = null;
  targetPredictedPosition = new Vector(0, 0);
  showHealthbar = true;
  /** Extra unnecessary damage dealt on death. */
  overkill = 0;
  /** Reference back to the world this entity is in. */
  world;
  constructor(world, x, y, health, speed, drawer, hitSize) {
    this.x = x;
    this.y = y;
    this.#previousPos = new Vector(x, y);
    this.rotation = 0;
    this.maxHealth = health;
    this.health = health;
    this.speed = speed;
    this.drawer = drawer;
    this.world = world;
    this.size = hitSize;
  }
  addStatus(status) {
    this.statuses.push(status);
    if (effect_registry[status.effect].onApply) {
      effect_registry[status.effect].onApply.apply(this);
    }
  }
  get actualSpeed() {
    return this.speed * this.#speedMultiplier;
  }
  tickDynamicVelocity(time) {
    if (this.speed != 0) {
      let now = new Vector(this.x, this.y);
      let distMoved = now.distanceTo(this.#previousPos);
      let angle = this.#previousPos.subtract(now).getAngle();
      let dt = time ? time : 1;
      let vel = distMoved / dt;
      this.dynamicVelocity.speed = vel;
      this.dynamicVelocity.direction = angle;
      this.#previousPos = now;
    } else {
      this.dynamicVelocity.speed = 0;
      this.dynamicVelocity.direction = 0;
    }
  }
  get hpMult() {
    return this.#hpMultiplier;
  }
  tickStatuses() {
    this.#hpMultiplier = 1;
    this.damageMultiplier = 1;
    this.#speedMultiplier = 1;
    for (let s of this.statuses) {
      let status = effect_registry[s.effect];
      if (s.time > 0) {
        if (status.tickChance ? Math.random() < status.tickChance : true) {
          status.tick.apply(this);
        }
        if (status.damage != null) {
          this.damage(status.damage, status.showIndicatorParticles ?? true);
        }
        if (status.healing != null) {
          this.heal(status.healing, status.showIndicatorParticles ?? true);
        }
        if (status.healthMult != null) {
          this.#hpMultiplier *= status.healthMult;
        }
        if (status.damageMult != null) {
          this.damageMultiplier *= status.damageMult;
        }
        if (status.speedMult != null) {
          this.#speedMultiplier *= status.speedMult;
        }
        s.time--;
      } else {
        if (effect_registry[s.effect].onEnd) {
          effect_registry[s.effect].onEnd.apply(this, [s]);
        }
        this.statuses.splice(this.statuses.indexOf(s), 1);
      }
    }
  }
  damage(amount, hideParticles = true) {
    let displayNum = Math.min(amount / this.#hpMultiplier, this.health);
    if (displayNum > 0 && !hideParticles) {
      this.world.particles.push(
        new TextParticle(
          this.x,
          this.y,
          rndScl(0, PI, 10),
          60,
          2,
          roundNum(displayNum, 2),
          10,
          [255, 0, 0, 255],
          0.03
        )
      );
    }
    let scaledDamage = amount / this.#hpMultiplier;
    if (this.health > scaledDamage) {
      this.health -= scaledDamage;
    } else {
      if (!this.dead) {
        this.overkill = scaledDamage - this.health;
        this.dead = true;
        this.health = 0;
        this.world.particles.push(
          new WaveParticle(
            this.x,
            this.y,
            20,
            0,
            40,
            [255, 255, 255],
            [255, 255, 255, 0],
            5,
            0
          )
        );
        this.remove();
      }
    }
  }
  heal(amount, hideParticles) {
    let displayNum = Math.min(
      amount / this.#hpMultiplier,
      this.maxHealth - this.health
    );
    if (displayNum > 0 && !hideParticles) {
      this.world.particles.push(
        new TextParticle(
          this.x,
          this.y,
          rndScl(0, PI, 10),
          60,
          2,
          roundNum(displayNum, 2),
          10,
          [0, 255, 0, 255],
          0.03
        )
      );
    }
    if (this.maxHealth - this.health >= amount / this.#hpMultiplier) {
      this.health += amount / this.#hpMultiplier;
    } else {
      this.health = this.maxHealth;
    }
  }
  remove() {
    for (let b of this.world.bullets) {
      if (
        b.attributableEntity &&
        b.attributableEntity == this &&
        b.removeOnAttributableEntityDeath
      ) {
        b.remove = true;
      }
    }
    this.removeExt();
    this.statuses = [];
  }
  removeExt() {}
  getPos() {
    return new Vector(this.x, this.y);
  }
  getSize() {
    return this.size;
  }
  tick() {
    this.tickExt();
    this.tickStatuses();
    this.tickDynamicVelocity();
  }
  tickExt() {}
  getPredictedPositionTime(time) {
    let moveVector = angleToVector(
      this.dynamicVelocity.direction
    ).getScaledVector(this.dynamicVelocity.speed * time);
    let thisVector = new Vector(this.x, this.y);
    return thisVector.subtract(moveVector);
  }
  getPredictedPositionDistSpd(distance, speed) {
    return this.getPredictedPositionTime(distance / speed);
  }
  getAdjustedPredictionDistSpd(distance, speed, adjustment) {
    let moveVector = angleToVector(
      this.dynamicVelocity.direction
    ).getScaledVector((this.dynamicVelocity.speed * distance) / speed);
    let thisVector = new Vector(this.x, this.y);
    return thisVector.subtract(moveVector.getScaledVector(adjustment));
  }
  draw() {
    if (this.showHealthbar && this.health < this.maxHealth) {
      push();
      rectMode(CORNER);
      fill(255, 0, 0);
      rect(
        this.x - this.size * 0.75,
        this.y - this.size * 1.5,
        this.size * 1.5,
        5
      );
      fill(0, 255, 0);
      rect(
        this.x - this.size * 0.75,
        this.y - this.size * 1.5,
        this.size * 1.5 * (this.health / this.maxHealth),
        5
      );
      pop();
    }
    this.drawer.rotDraw(this.x, this.y, this.rotation);
  }
}

class BloonType extends Entity {
  trackPoint = 0;
  progress = 0;
  leaked = false;
  damageSource = null;
  static type = "red";
  static difficulty = -1;
  constructor(
    world,
    map,
    trackIndex,
    health,
    speed,
    drawer,
    size,
    child,
    numChildren = 1
  ) {
    let track = map.tracks[trackIndex];
    if (!track) {
      console.warn(
        "Track " + trackIndex + " does not exist on map " + map.displayName
      );
      track = map.tracks[0];
    }
    super(
      world,
      track.points[0].x,
      track.points[0].y,
      health,
      speed,
      drawer,
      size
    );
    this.showHealthbar = false;
    this.track = map.tracks[trackIndex];
    this.map = map;
    this.trackIndex = trackIndex;
    this.child = child;
    this.numChildren = numChildren;
  }
  damage(amount, damageSource, hideParticles = true) {
    this.damageSource = damageSource;
    if (damageSource != null) {
      if (damageSource instanceof Tower) {
        damageSource.pops += Math.min(this.health, amount);
      }
    }
    super.damage(amount);
  }
  removeExt() {
    if (this.leaked) {
      this.world.particles.push(
        new WaveParticle(
          this.x,
          this.y,
          20,
          0,
          30,
          colours.ui.xp,
          colours.ui.xp,
          10,
          0
        )
      );
      for (let i = 0; i < 5; i++) {
        this.world.particles.push(
          new ShapeParticle(
            this.x,
            this.y,
            radians(rndScl(0, 360, 10)),
            40,
            rndScl(2, 4, 10),
            0.1,
            "rhombus",
            colours.ui.xp,
            colours.ui.xp,
            20,
            20,
            10,
            0,
            0
          )
        );
      }
      game.xp += rewards.xp.bloons[this.constructor.type];
      game.inventory.cash += 4; //not too sure about this
    } else {
      this.world.particles.push(
        new WaveParticle(
          this.x,
          this.y,
          15,
          0,
          40,
          [255, 255, 255, 255],
          [255, 255, 255, 0],
          10,
          0
        )
      );
      for (let i = 0; i < 10; i++) {
        this.world.particles.push(
          new ShapeParticle(
            this.x,
            this.y,
            radians(rndScl(0, 360, 10)),
            60,
            rndScl(3, 5, 10),
            0.25,
            "square",
            colours.bloons[this.constructor.type],
            colours.bloons[this.constructor.type],
            5,
            0,
            5,
            0,
            0
          )
        );
      }
    }
    this.split(this.overkill);
    this.world.bloons.splice(this.world.bloons.indexOf(this), 1);
  }
  split(damageToDeal = 0) {
    if (this.child) {
      for (let i = 0; i < this.numChildren; i++) {
        let child = new this.child(this.world, this.map, this.trackIndex);
        child.x = this.x;
        child.y = this.y;
        child.progress = this.progress;
        child.trackPoint = this.trackPoint;
        child.statuses = JSON.parse(JSON.stringify(this.statuses));
        this.world.bloons.push(child);
        child.damage(damageToDeal, this.damageSource);
      }
    }
  }
  tickExt() {
    let currentPoint = this.track.points[this.trackPoint];
    let nextPoint = this.track.points[this.trackPoint + 1];
    if (currentPoint == null) {
      console.warn("Track has no points!");
      this.remove();
    }
    if (nextPoint == null) {
      this.leaked = true;
      this.remove();
    } else {
      let delta = convertToVector(nextPoint).subtract(
        convertToVector(this.getPos())
      );
      let move = delta.getUnitVector().getScaledVector(this.actualSpeed);
      this.x += move.x;
      this.y += move.y;
      this.progress += this.actualSpeed;
      if (this.getPos().distanceTo(nextPoint) <= this.actualSpeed * 2) {
        this.x = nextPoint.x;
        this.y = nextPoint.y;
        this.trackPoint++;
      }
      //console.log(logPoint(nextPoint)+" => "+logPoint(this.getPos())+": "+this.getPos().distanceTo(nextPoint)+" ["+logPoint(delta)+"]")
    }
  }
}

const baseSpeed = 1.2;

class RedBloon extends BloonType {
  static type = "red";
  static difficulty = 0;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed,
      new DrawImage(images.bloons.red, 25, 32),
      10,
      null
    );
  }
}

class BlueBloon extends BloonType {
  static type = "blue";
  static difficulty = 1;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 1.4,
      new DrawImage(images.bloons.blue, 25, 32),
      10,
      RedBloon
    );
  }
}

class GreenBloon extends BloonType {
  static type = "green";
  static difficulty = 2;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 1.8,
      new DrawImage(images.bloons.green, 25, 32),
      10,
      BlueBloon
    );
  }
}

class YellowBloon extends BloonType {
  static type = "yellow";
  static difficulty = 3;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 3.2,
      new DrawImage(images.bloons.yellow, 25, 32),
      10,
      GreenBloon
    );
  }
}

class PinkBloon extends BloonType {
  static type = "pink";
  static difficulty = 4;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 3.5,
      new DrawImage(images.bloons.pink, 25, 32),
      10,
      YellowBloon
    );
  }
}

class BlackBloon extends BloonType {
  static type = "black";
  static difficulty = 5;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 1.8,
      new DrawImage(images.bloons.black, 15, 18),
      7,
      PinkBloon,
      2
    );
  }
}

class WhiteBloon extends BloonType {
  static type = "white";
  static difficulty = 5;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 2,
      new DrawImage(images.bloons.white, 15, 18),
      7,
      PinkBloon,
      2
    );
  }
}

class PurpleBloon extends BloonType {
  static type = "purple";
  static difficulty = 5;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 3,
      new DrawImage(images.bloons.purple, 25, 32),
      10,
      PinkBloon,
      2
    );
  }
}

class ZebraBloon extends BloonType {
  static type = "zebra";
  static difficulty = 6;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 1.8,
      new DrawImage(images.bloons.zebra, 25, 32),
      10,
      WhiteBloon,
      2
    );
  }
}

class LeadBloon extends BloonType {
  static type = "zebra";
  static difficulty = 6;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed,
      new DrawImage(images.bloons.lead, 25, 32),
      10,
      BlackBloon,
      2
    );
  }
}

class RainbowBloon extends BloonType {
  static type = "rainbow";
  static difficulty = 7;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      1,
      baseSpeed * 2.2,
      new DrawImage(images.bloons.rainbow, 25, 32),
      10,
      ZebraBloon,
      2
    );
  }
}

class CeramicBloon extends BloonType {
  static type = "ceramic";
  static difficulty = 8;
  constructor(world, map, trackIndex) {
    super(
      world,
      map,
      trackIndex,
      10,
      baseSpeed * 2.5,
      new DrawImage(images.bloons.ceramic, 25, 32),
      10,
      RainbowBloon,
      2
    );
  }
}

class Tower extends Entity {
  static targetingPriorities = ["first", "last", "close", "far", "strong"];
  _targetPriority = "first"; //first, last, close, far, strong
  _reloadLeft = 0;
  _target = null;
  constructor(world, x, y, drawer, bullet, reload, range, size) {
    super(world, x, y, 1000, 0, drawer, size);
    this.bullet = bullet;
    this.reload = reload;
    this.range = range;
    this.displayName = "Tower";
    this.tier = "0";
    this.path = "Only";
    this.pops = 0;
  }
  tickExt() {
    this.findTarget();
    if (this._reloadLeft > 0) {
      this._reloadLeft--;
      return;
    } else {
      if (this._target) {
        this.fire();
      }
    }
  }
  findTarget() {
    let target,
      finalDist = 0;
    if (this._targetPriority === "close") {
      let minDist = Infinity;
      for (let e of this.world.bloons) {
        let dist = this.getPos().distanceTo(e.getPos());
        if (dist <= this.range + e.size) {
          if (dist < minDist) {
            minDist = dist;
            finalDist = minDist;
            target = e;
          }
        }
      }
    } else if (this._targetPriority === "far") {
      let maxDist = 0;
      for (let e of this.world.bloons) {
        let dist = this.getPos().distanceTo(e.getPos());
        if (dist <= this.range + e.size) {
          if (dist > maxDist) {
            maxDist = dist;
            finalDist = maxDist;
            target = e;
          }
        }
      }
    } else if (this._targetPriority === "last") {
      let minProgress = Infinity;
      for (let e of this.world.bloons) {
        let dist = this.getPos().distanceTo(e.getPos());
        if (dist <= this.range + e.size) {
          if (e.progress < minProgress) {
            minProgress = e.progress;
            finalDist = dist;
            target = e;
          }
        }
      }
    } else if (this._targetPriority === "first") {
      let maxProgress = 0;
      for (let e of this.world.bloons) {
        let dist = this.getPos().distanceTo(e.getPos());
        if (dist <= this.range + e.size) {
          if (e.progress > maxProgress) {
            maxProgress = e.progress;
            finalDist = dist;
            target = e;
          }
        }
      }
    } else if (this._targetPriority === "strong") {
      let maxDifficulty = -Infinity;
      for (let e of this.world.bloons) {
        let dist = this.getPos().distanceTo(e.getPos());
        if (dist <= this.range + e.size) {
          if (e.constructor.difficulty > maxDifficulty) {
            maxDifficulty = e.constructor.difficulty;
            finalDist = dist;
            target = e;
          }
        }
      }
    }

    //Actually point at target
    this._target = target;
    if (target) {
      let aimAt = target.getAdjustedPredictionDistSpd(
        finalDist - target.size,
        this.bullet.speed ?? 10,
        2
      );
      if(this.bullet.type === PointBullet){
        aimAt = target.getPos()
      }
      this.rotation = this.getPos().angleTo(aimAt);
      this.world.particles.push(
        new ShapeParticle(
          aimAt.x,
          aimAt.y,
          0,
          1,
          0,
          0,
          "circle",
          [255, 0, 0],
          [255, 0, 0],
          10,
          10,
          10,
          10,
          0
        )
      );
      return target;
    }
    return null;
  }
  fire() {
    console.log(this.bullet);
    let bulletToFire = bullet(this.bullet, this);
    bulletToFire.x = this.x;
    bulletToFire.y = this.y;
    bulletToFire.direction = this.rotation;
    bulletToFire.directedAt = this._target;
    this.world.bullets.push(bulletToFire);
    this._reloadLeft = this.reload;
  }
  draw() {
    super.draw();
    if (this.getPos().distanceTo(new Vector(mouseX, mouseY)) < this.size) {
      noStroke();
      fill(100, 100);
      circle(this.x, this.y, this.range * 2);
      fill(255);
      stroke(0);
      strokeWeight(1);
      textSize(13);
      text(this.displayName, this.x, this.y - this.size - textSize() * 3.12);
      text(
        this.path + " path, Tier " + this.tier,
        this.x,
        this.y - this.size - textSize() * 2.12
      );
      text(
        "Targeting: " + this._targetPriority,
        this.x,
        this.y - this.size - textSize() * 1.12
      );
      text(this.pops + " pops", this.x, this.y + this.size + textSize() * 1.12);
    }
  }
  setTargetingPrio(prio) {
    if (Tower.targetingPriorities.includes(prio)) {
      this._targetPriority = prio;
    } else {
      console.warn(
        "Targeting priority '" +
          prio +
          "' does not exist, or has not been implemented yet."
      );
    }
  }
}

const towers = {
  TestTower: class TestTower extends Tower {
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
  },
  TestSniper: class TestSniper extends Tower {
    constructor(world, x, y) {
      let bulletToAdd = {
        type: PointBullet,
        damage: 7,
        size: 10,
        drawer: new DrawShape("rect", [255, 0, 0], [255, 0, 0], 0, 4, 6),
        trailColour: [255, 0, 0],
        trailSize: 2,
      };
      super(
        world,
        x,
        y,
        new DrawShape("rect", [255, 0, 0], [0, 0, 0], 3, 10, 20),
        bulletToAdd,
        90,
        1000,
        10
      );
      this.displayName = "Test Sniper";
      this.tier = 2;
    }
  },
};

function logPoint(point) {
  return "(x: " + point.x + ", y: " + point.y + ")";
}
