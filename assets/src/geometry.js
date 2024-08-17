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

let noTextureError
//So I don't have to write this crap out 324 times
function modImage(img, img_x, img_y, img_width, img_height){
  image(img, img_x, img_y, img_width, img_height)
}

function RADImage(img, img_x, img_y, img_width, img_height, img_angle) {
  translate(img_x, img_y);
  rotate(img_angle);
  modImage(img, 0, 0, img_width, img_height);
  rotate(-(img_angle));
  translate(-(img_x), -(img_y));
}

function trueClone(obj){
  return Object.create(
    Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj)
  );
}

function RADShape(shape, shape_x, shape_y, shape_width, shape_height, shape_angle, context = globalThis) {
  context.push()
  context.rectMode(CENTER)
  context.translate(shape_x, shape_y);
  context.rotate(shape_angle);
  switch (shape) {
    case 'circle':
      context.circle(0, 0, (shape_width + shape_height) / 2);
      break;
    case 'square':
      context.square(0, 0, (shape_width + shape_height) / 2);
      break;
    case 'rhombus':
      context.scale(shape_width,shape_height)
      context.rotate(QUARTER_PI);
      context.square(0, 0, 1);
      context.scale(1,1)
      context.rotate(-QUARTER_PI);
      break;
    case 'rect':
      context.rect(0, 0, shape_width, shape_height);
      break;
    case 'ellipse':
      context.ellipse(0, 0, shape_width, shape_height);
      break;
    default:
      context.image(noDrawerError, 0, 0, shape_width, shape_height);
      break;
  }
  context.pop()
}

function angleToVector(angle) {
  return new Vector(Math.cos(angle), Math.sin(angle));
}

function convertToVector(object){
  return new Vector(object.x ?? 0, object.y ?? 0);
}

//Helpful(?) class
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vct) {
    return new Vector(this.x + vct.x, this.y + vct.y);
  }
  subtract(vct) {
    return new Vector(this.x - vct.x, this.y - vct.y);
  }
  mult(num) {
    return new Vector(this.x * num, this.y * num);
  }
  getMagnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  getUnitVector() {
    let mag = this.getMagnitude()
    return new Vector(this.x / mag, this.y / mag);
  }
  getScaledVector(num) {
    return new Vector(this.x * num, this.y * num);
  }
  getAngle() {
    return Math.atan2(this.y, this.x);
  }
  angleTo(vct){
    return vct.subtract(this).getAngle()
  }
  angleBetween(vct){
    return Math.abs(this.getAngle() - vct.getAngle())
  }
  getDotProduct(vct) {
    return this.getMagnitude() * vct.getMagnitude() * Math.cos(this.getAngle() - vct.getAngle());
  }
  interpolate(vct, t) {
    return new Vector(this.x + (vct.x - this.x) * t, this.y + (vct.y - this.y) * t);
  }
  normalise() { //In case I need to use this
    this.x = this.getUnitVector().x
    this.y = this.getUnitVector().y
  }
  rotate(angle) {
    let x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    let y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    return new Vector(x, y);
  }
  distanceTo(vct) {
    return Math.sqrt((this.x - vct.x) ** 2 + (this.y - vct.y) ** 2);
  }
}
//Some vectors
const VCT_UP = new Vector(0, -1)
const VCT_DOWN = new Vector(0, 1)
const VCT_LEFT = new Vector(-1, 0)
const VCT_RIGHT = new Vector(1, 0)


//The actual drawing bit
class Drawer {
  constructor(sizeX, sizeY, options) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.layer = -1;
    this.options = options?options:{}
  }
  draw(x, y){ }
  drawBetween(start, end){ }
  drawTo(x, y){ }
  drawAbsolute(){ }
  rotDraw(x, y, angle){ }
}

class DrawShape extends Drawer { //Draws a simple vector shape.
  #type
  #colour
  #outlineColour
  #outlineWidth
  constructor(type, colour, outlineColour, outlineWidth, sizeX, sizeY, options) {
    super(sizeX, sizeY, options);
    this.layer = 2;
    this.#type = type;
    this.#colour = colour;
    this.#outlineColour = outlineColour;
    this.#outlineWidth = outlineWidth;
    if (this.#colour[3] == null) {
      this.#colour[3] = 255;
    }
    if (this.#outlineColour[3] == null) {
      this.#outlineColour[3] = 255;
    }
  }
  draw(x, y) {
    this.rotDraw(x, y, 0)
  }
  rotDraw(x, y, angle) {
    push()
    fill(this.#colour[0], this.#colour[1], this.#colour[2], this.#colour[3]);
    stroke(this.#outlineColour[0], this.#outlineColour[1], this.#outlineColour[2], this.#outlineColour[3]);
    strokeWeight(this.#outlineWidth)
    let option_scale = this.options?.scale?this.options.scale:1
    RADShape(this.#type, x, y, this.sizeX * option_scale, this.sizeY * option_scale, angle)
    pop()
  }
  setCol(red, green, blue, alpha){
    this.#colour[0] = red;
    this.#colour[1] = green;
    this.#colour[2] = blue;
    this.#colour[3] = alpha;
    if (alpha == null) {
      this.#colour[3] = 255;
    }
  }
  changeCol(red, green, blue, alpha){
    this.#colour[0] += red;
    this.#colour[1] += green;
    this.#colour[2] += blue;
    this.#colour[3] += alpha;
    if (alpha == null) {
      this.#colour[3] = 255;
    }
  }
}

class DrawImage extends Drawer { //Draws an image from a file.
  #errored
  constructor(image, sizeX, sizeY, options) {
    super(sizeX, sizeY, options);
    this.layer = 1;
    this.image = image;
    this.errored = false;
    this.fade = 0
  }
  draw(x, y) {
    this.rotDraw(x, y, 0)
  }
  rotDraw(x, y, angle) {
    let option_scale = this.options?.scale?this.options.scale:1
    try {
      if(this.fade > 0){
        tint(255, 255 - this.fade)
      }
      RADImage(this.image, x, y, this.sizeX * option_scale, this.sizeY * option_scale, angle);
      this.#errored = false;
    }
    catch (error) {
      console.error(error)
      RADImage(noTextureError, x, y, 30, 30, angle);
      try {
        if (!this.#errored) {
          console.warn("Error drawing texture " + this.image + ". Has this texture been preloaded? If so, check spelling and capitalisation.");
          this.#errored = true;
        }
      }
      catch (error) {
        if (!this.#errored) {
          console.error("No texture defined for drawer! Error: " + error)
          this.#errored = true;
        }
      }
    }
  }
  addFade(factor){
    this.fade += factor
  }
}

class DrawMulti { //Class for drawing multiple things at once. Does nothing on its own.
  constructor(drawers) {
    this.drawers = drawers;
  }
  draw(x, y) {
    for (let d = 0; d < this.drawers.length; d++) {
      this.drawers[d].draw(x, y);
    }
  }
  rotDraw(x, y, angle) {
    for (let d = 0; d < this.drawers.length; d++) {
      this.drawers[d].rotDraw(x, y, angle);
    }
  }
  go() {
    for (let d of this.drawers) {
      if (d instanceof DrawMulti || d instanceof DrawAnimated) {
        d.go()
      }
    }
  }
  drawBetween(start, end){
    for(let d of this.drawers){
      d.drawBetween(start, end);
    }
  }
  drawTo(x, y){
    for(let d of this.drawers){
      d.drawTo(x, y)
    }
  }
  drawAbsolute(){
    for(let d of this.drawers){
      d.drawAbsolute()
    }
  }
  setStart(start){
    for(let d of this.drawers){
      if(d instanceof DrawLightning || d instanceof DrawMulti || d instanceof DrawLine){
        d.setStart(start)
      }
    } 
  }
  setEndpoint(end){
    for(let d of this.drawers){
      if(d instanceof DrawLightning || d instanceof DrawMulti || d instanceof DrawLine){
        d.setEndpoint(end)
      }
    } 
  }
  changeCol(red, green, blue, alpha){
    for(let d of this.drawers){
      if(d instanceof DrawShape){
        d.changeCol(red, green, blue, alpha)
      }
    } 
  }
  changeColSpecific(red, green, blue, alpha, drawers){
    if(drawers instanceof Array){
      for(let d of drawers){
        if(this.drawers[d] instanceof DrawShape){
          this.drawers[d].changeCol(red, green, blue, alpha)
        }
      }
    }
    else{
      if(this.drawers[drawers] instanceof DrawShape){
        this.drawers[drawers].changeCol(red, green, blue, alpha)
      }
    }
  }
  setColSpecific(red, green, blue, alpha, drawers){
    if(drawers instanceof Array){
      for(let d of drawers){
        if(this.drawers[d] instanceof DrawShape){
          this.drawers[d].setCol(red, green, blue, alpha)
        }
      }
    }
    else{
      if(this.drawers[drawers] instanceof DrawShape){
        this.drawers[drawers].setCol(red, green, blue, alpha)
      }
    }
  }
  setCol(red, green, blue, alpha){
    for(let d of this.drawers){
      if(d instanceof DrawShape){
        d.setCol(red, green, blue, alpha)
      }
    } 
  }
}

class DrawAnimated { //Puts an animation on a drawer.
  constructor(drawer, animation) {
    this.drawer = drawer;
    this.animation = animation;
  }
  draw(x, y) {
    this.stepAnimation()
    let slideVector = new Vector(0, this.animation.renderSlide).rotate(radians(this.animation.renderRotation));
    this.drawer.rotDraw(x + this.animation.renderX + slideVector.x, y + this.animation.renderY + slideVector.y, radians(this.animation.renderRotation));
  }
  rotDraw(x, y, angle) {
    this.stepAnimation()
    let slideVector = new Vector(0, this.animation.renderSlide).rotate(angle + radians(this.animation.renderRotation));
    this.drawer.rotDraw(x + this.animation.renderX + slideVector.x, y + this.animation.renderY + slideVector.y, angle + radians(this.animation.renderRotation));
  }
  stepAnimation() {
    this.animation.step();
  }
  go() {
    if (this.animation instanceof ActivatedAnimation) {
      this.animation.go()
    }
  }
}

class Animation { //Template class for animations. Does nothing on its own.
  constructor(changeX, changeY, changeRotation, changeSlide, time) {
    this.changeX = changeX;
    this.renderX = 0;
    this.changeY = changeY;
    this.renderY = 0;
    this.changeRotation = changeRotation;
    this.renderRotation = 0;
    this.changeSlide = changeSlide;
    this.renderSlide = 0;
    this.time = time;
  }
  step() { }
}

class BounceAnimation extends Animation { //Simple animation that plays, then plays in reverse.
  #frame
  #section
  constructor(changeX, changeY, changeRotation, changeSlide, time) {
    super(changeX, changeY, changeRotation, changeSlide, time);
    this.#frame = 0
    this.#section = 0
  }
  step() {
    if (this.#section == 0) {
      if (this.#frame < this.time * 60) {
        this.renderX += this.changeX / (60 * this.time);
        this.renderY += this.changeY / (60 * this.time);
        this.renderRotation += this.changeRotation / (60 * this.time);
        this.renderSlide += this.changeSlide / (60 * this.time);
        this.#frame ++
      }
      else {
        this.#section = 1
      }
    }
    else {
      if (this.#frame > 0) {
        this.renderX -= this.changeX / (60 * this.time);
        this.renderY -= this.changeY / (60 * this.time);
        this.renderRotation -= this.changeRotation / (60 * this.time);
        this.renderSlide -= this.changeSlide / (60 * this.time);
        this.#frame --
      }
      else {
        this.#section = 0
      }
    }
  }
}

class LoopAnimation extends Animation { //Simple animation that loops continuously.
  #frame
  #section
  constructor(changeX, changeY, changeRotation, changeSlide, time) {
    super(changeX, changeY, changeRotation, changeSlide, time);
    this.#frame = 0
    this.#section = 0
  }
  step() {
    if (this.#section == 0) {
      if (this.#frame < this.time * 60) {
        this.renderX += this.changeX / (60 * this.time);
        this.renderY += this.changeY / (60 * this.time);
        this.renderRotation += this.changeRotation / (60 * this.time);
        this.renderSlide += this.changeSlide / (60 * this.time);
        this.#frame ++
      }
      else {
        this.#section = 1
      }
    }
    else {
      this.renderX = 0
      this.renderY = 0
      this.renderRotation = 0
      this.#frame = 0
      this.#section = 0
    }
  }
}

class InfiniteAnimation extends Animation { //Simple animation which plays continuously.
  #frame
  constructor(changeX, changeY, changeRotation, changeSlide, time) {
    super(changeX, changeY, changeRotation, changeSlide, time);
    this.#frame = 0
  }
  step() {
    this.renderX += this.changeX / (60 * this.time);
    this.renderY += this.changeY / (60 * this.time);
    this.renderRotation += this.changeRotation / (60 * this.time);
    this.renderSlide += this.changeSlide / (60 * this.time);
    this.#frame ++
  }
}

class DrawOffset { //Class for offsetting a drawer. Does nothing on its own.
  constructor(drawer, offsetX, offsetY) {
    this.drawer = drawer;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
  draw(x, y) {
    this.drawer.draw(x + this.offsetX, y + this.offsetY);
  }
  rotDraw(x, y, angle){
    this.drawer.rotDraw(x + this.offsetX, y + this.offsetY, angle);
  }
}

class DrawRotatedOffset { //Class for offsetting a drawer. Does nothing on its own.
  constructor(drawer, offsetX, offsetY, offsetRot) {
    this.drawer = drawer;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.offsetRot = offsetRot;
  }
  draw(x, y) {
    this.drawer.rotDraw(x + this.offsetX, y + this.offsetY, this.offsetRot);
  }
  rotDraw(x, y, angle){
    this.drawer.rotDraw(x + this.offsetX, y + this.offsetY, angle + this.offsetRot);
  }
}

class AnimateMulti { //Class for playing multiple animations on the same drawer. Does nothing on its own.
  constructor(animations) {
    this.animations = animations;
    this.renderX = 0
    this.renderY = 0
    this.renderRotation = 0
    this.renderSlide = 0
  }
  step() {
    this.renderX = 0
    this.renderY = 0
    this.renderRotation = 0
    this.renderSlide = 0
    for (let a of this.animations) {
      a.step();
      this.renderX += a.renderX;
      this.renderY += a.renderY;
      this.renderRotation += a.renderRotation;
      this.renderSlide += a.renderSlide;
    }
  }
}

function drawGlowShape(type, colour, outlineColour, outlineWidth, sizeX, sizeY) {
  let drawer
  let drawmulti = []
  for (let i = 0; i < 10; i++) {
    let newcol = [outlineColour[0], outlineColour[1], outlineColour[2], outlineColour[3] / 10]
    drawer = new DrawShape(type, colour, newcol, outlineWidth * i, sizeX, sizeY);
    drawmulti.push(drawer)
  }
  return new DrawMulti(drawmulti);
}

function drawGlowShapeLight(type, colour, outlineColour, outlineWidth, sizeX, sizeY) {
  let drawer
  let drawmulti = []
  for (let i = 0; i < 4; i++) {
    let newcol = additiveLightenColour([outlineColour[0], outlineColour[1], outlineColour[2], outlineColour[3] / 4], 64 * (i + 1))
    drawer = new DrawShape(type, colour, newcol, outlineWidth * i, sizeX, sizeY);
    drawmulti.push(drawer)
  }
  return new DrawMulti(drawmulti);
}

//Collision detection

//pointCollidesCircle(object x, object y, circle centre x, circle centre y, circle radius)
function pointCollidesCircle(ox, oy, cx, cy, r) {
  return (new Vector(cx, cy).distanceTo(new Vector(ox, oy)) <= r)
}

//pointCollidesRect(object x, object y, rect centre x, rect centre y, rect Δx, rect Δy)
function pointCollidesRect(ox, oy, cx, cy, dx, dy) {
  return (ox >= (cx - dx) && ox <= (cx + dx) && oy >= (cy - dy) && oy <= (cy + dy))
}

//rectCollidesRect(object x, object y, object Δx, object Δy, rect centre x, rect centre y, rect Δx, rect Δy)
function rectCollidesRect(ox, oy, odx, ody, cx, cy, dx, dy) {
  return ((ox + odx) >= (cx - dx) && (ox - odx) <= (cx + dx) && (oy + ody) >= (cy - dy) && (oy - ody) <= (cy + dy))
}

//circleCollidesCircle(object x, object y, object radius, circle centre x, circle centre y, circle radius)
function circleCollidesCircle(ox, oy, or, cx, cy, r) {
  return (new Vector(cx, cy).distanceTo(new Vector(ox, oy)) <= r + or)
}

class DrawLine extends Drawer{ //Pretty boring really. Draws a straight line. That's it.
  constructor(start, end, colour, weight, options){
    super(weight, weight, options)
    this.start = start
    this.end = end
    this.colour = colour
    this.weight = weight
    if(this.colour[3] == null){
      this.colour[3] = 255
    }
  }
  draw(x, y){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    line(x + this.start.x, y + this.start.y, x + this.end.x , y + this.end.y)
    pop()
  }
  drawAbsolute(){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    line(this.start.x, this.start.y, this.end.x, this.end.y)
    pop()
  }
  drawTo(x, y){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    line(this.start.x, this.start.y, x, y)
    pop()
  }
  setStart(start){
    this.start = start
  }
  setEndpoint(end){
    this.end = end
  }
}

class DrawCurve extends DrawLine{ //Draws a curve from relative vectors. Doesn't rotate.
  constructor(start, vertices, control, end, weight, colour, options){
    super(start, end, colour, weight, options)
    this.vertices = vertices
    this.control = control
  }
  draw(x, y){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    noFill()
    beginShape()
    vertex(x + this.start.x, y + this.start.y)
    for(let i = 0; i < this.vertices.length; i++){
      quadraticVertex(this.control[i-1].x + x, this.control[i-1].y + y, this.vertices[i].x + x, this.vertices[i].y + y)
    }
    vertex(this.end.x, this.end.y)
    endShape()
    pop()
  }
  drawAbsolute(){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    noFill()
    beginShape()
    vertex(this.start.x, this.start.y)
    for(let i = 0; i < this.vertices.length; i++){
      quadraticVertex(this.control[i].x, this.control[i].y, this.vertices[i].x, this.vertices[i].y)
    }
    vertex(this.end.x, this.end.y)
    endShape()
    pop()
  }
}

class DrawTriangularCurve extends DrawCurve{ //Draws a line from relative vectors. Doesn't rotate.
  draw(x, y){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    noFill()
    beginShape()
    vertex(x + this.start.x, y + this.start.y)
    for(let i = 0; i < this.vertices.length; i++){
      vertex(this.control[i-1].x + x, this.control[i-1].y + y, this.vertices[i].x + x, this.vertices[i].y + y)
    }
    vertex(this.end.x, this.end.y)
    endShape()
    pop()
  }
  drawAbsolute(){
    push()
    stroke(this.colour[0], this.colour[1], this.colour[2], this.colour[3])
    strokeWeight(this.weight)
    noFill()
    beginShape()
    vertex(this.start.x, this.start.y)
    for(let i = 0; i < this.vertices.length; i++){
      vertex(this.control[i].x, this.control[i].y, this.vertices[i].x, this.vertices[i].y)
    }
    vertex(this.end.x, this.end.y)
    endShape()
    pop()
  }
}

class DrawLightning extends Drawer{ //Creates 3 rotated oscillating curves.
  constructor(start, end, colour, weight, mode, oscScl, iterations, amplitude, oscVariation, iterVariation, ampVariation, options){
    super(weight, weight, options);
    this.start = start;
    this.end = end;
    this.colour = colour;
    if(this.colour[3] == null){
      this.colour[3] = 255
    }
    this.initialColour = colour;
    this.initialAlpha = this.colour[3]
    this.weight = weight;
    this.initialWeight = weight;
    if(mode == null || mode == "random"){
      this.oscScl = [rnd(-10, 10), rnd(12, -12), rnd(15, -15)]
      this.iterations = [Math.round(rnd(5, 7)), Math.round(rnd(3, 9)), Math.round(rnd(4, 6))]
      this.amplitude = [rnd(-1, 2), rnd(1, -2), rnd(-2, 2)]
    }
    else if(mode == "variation"){
      this.oscScl = [oscScl + rnd(-oscVariation, oscVariation), oscScl + rnd(-oscVariation, oscVariation), oscScl + rnd(-oscVariation, oscVariation)]
      this.iterations = [iterations + Math.round(rnd(-iterVariation, iterVariation)), iterations + Math.round(rnd(-iterVariation, iterVariation)), iterations + Math.round(rnd(-iterVariation, iterVariation))]
      this.amplitude = [amplitude + rnd(-ampVariation, ampVariation), amplitude + rnd(-ampVariation, ampVariation), amplitude + rnd(-ampVariation, ampVariation)]
    }
    else if(mode == "fixed"){
      this.oscScl = [oscScl, -oscScl, oscScl*0.5]
      this.iterations = [Math.round(iterations*0.75), iterations, iterations*2]
      this.amplitude = [-amplitude*0.5, amplitude, amplitude*1.5]
    }
    this.originalIterations = iterations
    this.originalAmplitude = amplitude
    this.originalOscScl = oscScl
    this.oscVariation = oscVariation
    this.iterVariation = iterVariation
    this.ampVariation = ampVariation
    this.mode = mode
  }
  draw(x, y){
    this.setEndpoint(new Vector(x, y))
    this.drawCurve()
  }
  drawAbsolute(){
    this.drawCurve()
  }
  recalculate(){
    if(this.mode == null || this.mode == "random"){
      this.oscScl = [rnd(-10, 10), rnd(12, -12), rnd(15, -15)]
      this.iterations = [Math.round(rnd(5, 7)), Math.round(rnd(3, 9)), Math.round(rnd(4, 6))]
      this.amplitude = [rnd(-1, 2), rnd(1, -2), rnd(-2, 2)]
    }
    else if(this.mode == "variation"){
      this.oscScl = [this.originalOscScl + rnd(-this.oscVariation, this.oscVariation), this.originalOscScl + rnd(-this.oscVariation, this.oscVariation), this.originalOscScl + rnd(-this.oscVariation, this.oscVariation)]
      this.iterations = [this.originalIterations + Math.round(rnd(-this.iterVariation, this.iterVariation)), this.originalIterations + Math.round(rnd(-this.iterVariation, this.iterVariation)), this.originalIterations + Math.round(rnd(-this.iterVariation, this.iterVariation))]
      this.amplitude = [this.originalAmplitude + rnd(-this.ampVariation, this.ampVariation), this.originalAmplitude + rnd(-this.ampVariation, this.ampVariation), this.originalAmplitude + rnd(-this.ampVariation, this.ampVariation)]
    }
    else if(this.mode == "fixed"){
      this.oscScl = [this.originalOscScl, -this.originalOscScl, this.originalOscScl*0.5]
      this.iterations = [Math.round(this.originalIterations*0.75), this.originalIterations, this.originalIterations*2]
      this.amplitude = [-this.originalAmplitude*0.5, this.originalAmplitude, this.originalAmplitude*1.5]
    }
  }
  drawBetween(start, end){
    if(start != null){
      if(start.x == null){
        start.x = 0
      }
      if(start.y == null){
        start.y = 0
      }
    }
    else{
      start = new Vector(0, 0)
    }
    if(end != null){
      if(end.x == null){
        end.x = 0
      }
      if(end.y == null){
        end.y = 0
      }
    }
    else{
      end = new Vector(800, 800)
    }
    this.setStart(start)
    this.setEndpoint(end)
    this.drawAbsolute()
  }
  setStart(start){
    this.start = start
  }
  setEndpoint(end){
    this.end = end
  }
  drawCurve(){
    this.weight = this.initialWeight * 1
    this.colour = additiveLightenColour(this.initialColour, -50)
    this.colour[3] = this.initialColour[3] * 1
    this.drawBaseline()

    this.weight = this.initialWeight * 0.75
    this.colour = this.initialColour
    this.colour[3] = this.initialColour[3] * 0.75
    this.drawBaseline()

    this.weight = this.initialWeight * 0.5
    this.colour = additiveLightenColour(this.initialColour, 150)
    this.colour[3] = this.initialColour[3] * 0.5
    this.drawBaseline()

    this.weight = this.initialWeight * 0.25
    this.colour = additiveLightenColour(this.initialColour, 255)
    this.colour[3] = this.initialColour[3] * 0.25
    this.drawBaseline()

    this.weight = this.initialWeight
    this.colour = this.initialColour
    this.colour[3] = this.initialAlpha
  }
  drawBaseline(){
    generateAnimatedInterpolationCurve(this.start, this.end, frameCount, this.amplitude[0], this.iterations[0], this.oscScl[0], this.weight, this.colour).drawAbsolute();
    generateAnimatedInterpolationCurve(this.start, this.end, frameCount, this.amplitude[1], this.iterations[1], this.oscScl[1], this.weight, this.colour).drawAbsolute();
    generateAnimatedInterpolationCurve(this.start, this.end, frameCount, this.amplitude[2], this.iterations[2], this.oscScl[2], this.weight, this.colour).drawAbsolute();
  }
}

function generateAnimatedInterpolationCurve(start, end, tick, amplitude, iterations, oscScl, weight, colour){ // function for use in DrawLightning
  let vertices = [], control = []
  let dist = start.distanceTo(end)
  for(let i = 0; i <= iterations; i ++){
    let vct = start.interpolate(end, i/iterations)
    vertices.push(vct)
    let smallvct = start.subtract(vct).getScaledVector(1/i).getScaledVector(amplitude / iterations / (dist/1000))
    let turnedVct = smallvct.rotate(radians(60)).getScaledVector(Math.cos(radians(tick * oscScl)))
    if(i % 2 == 0){
      turnedVct = turnedVct.getScaledVector(-1)
    }
    let vertex = vct.add(turnedVct)
    control.push(vertex)
  }
  return new DrawCurve(start, vertices, control, end, weight, colour)
}

function lightenColour(col, factor){
  let newCol = [col[0], col[1], col[2], col[3]]
  newCol = [newCol[0] * factor, newCol[1] * factor, newCol[2] * factor, newCol[3]]
  if(newCol[0] > 255){ newCol[0] = 255 }
  if(newCol[1] > 255){ newCol[1] = 255 }
  if(newCol[2] > 255){ newCol[2] = 255 }
  return newCol
}

function additiveLightenColour(col, factor){
  let newCol = [col[0], col[1], col[2], col[3]]
  newCol = [newCol[0] + factor, newCol[1] + factor, newCol[2] + factor, newCol[3]]
  if(newCol[0] > 255){ newCol[0] = 255 }
  if(newCol[1] > 255){ newCol[1] = 255 }
  if(newCol[2] > 255){ newCol[2] = 255 }
  return newCol
}

function blendColours(col1, col2, col1Factor){
  let col2Factor = 1 - col1Factor
  let newCol1 = [col1[0] * col1Factor, col1[1] * col1Factor, col1[2] * col1Factor, (col1[3] ?? 255) * col1Factor]
  let newCol2 = [col2[0] * col2Factor, col2[1] * col2Factor, col2[2] * col2Factor, (col2[3] ?? 255) * col2Factor]
  let newCol = [newCol1[0] + newCol2[0], newCol1[1] + newCol2[1], newCol1[2] + newCol2[2], newCol1[3] + newCol2[3]]
  if(newCol[0] > 255){ newCol[0] = 255 }
  if(newCol[1] > 255){ newCol[1] = 255 }
  if(newCol[2] > 255){ newCol[2] = 255 }
  if(newCol[3] > 255){ newCol[3] = 255 }
  return newCol
}

function roundNum(num, dp){
  return(Math.round(num * (10 ** dp))/ (10 ** dp))
}

function rnd(a, b) {
  if (b > a) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }
  else {
    return Math.floor(Math.random() * (a - b + 1)) + b;
  }
}

function rndScl(a, b, scl){
  return rnd(a*scl, b*scl)/scl
}

function degToRad(degrees){
  return degrees/180 * Math.PI
}

function radToDeg(radians){
  return radians/Math.PI * 180
}