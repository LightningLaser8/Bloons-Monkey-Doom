class MessageType {
  static Default = new MessageType()
  static Normal = new MessageType([200, 200, 200], [255, 255, 255], "→ ")
  static Warning = new MessageType([255, 250, 100], [255, 255, 0], "⚠ ")
  static Error = new MessageType([255, 100, 100], [255, 0, 0], "✖ ")
  constructor(colour = [255, 255, 255], textColour = [255, 255, 255], prefix = "") {
    this.colour = colour;
    this.textColour = textColour
    this.prefix = prefix;
  }
  get [Symbol.toStringTag](){
    return this.constructor.name
  }
  getDefault(){
    return new ConsoleMessage("", this)
  }
}
class ConsoleMessage {
  static Blank = new ConsoleMessage()
  static fromString(str = ""){
    return new ConsoleMessage(str, MessageType.Default)
  }
  #type = MessageType.Default;
  #content = ""
  time = 180
  constructor(content = "", type = MessageType.Default) {
    this.#content = content;
    this.#type = type;
    this.time = 360;
  }
  get [Symbol.toStringTag](){
    return this.constructor.name
  }
  toString(){
    return "" + this.#type.prefix + this.#content
  }
  create(){
    return new ConsoleMessage(this.#content, this.#type)
  }
  getColour(){
    return this.#type.colour
  }
  getTextColour(){
    return this.#type.textColour
  }
  changeType(newType){
    this.#type = (newType instanceof MessageType)?newType:MessageType.Default
  }
  withType(newType){
    return new ConsoleMessage(this.#content, (newType instanceof MessageType)?newType:MessageType.Default)
  }
  concat(other){

  }
}
class InGameConsole{
  static getCurrentStackTrace(){
    return new Error().stack
  }
  #messages = []
  constructor(){}
  get [Symbol.toStringTag](){
    return this.constructor.name
  }
  getFirstText(){
    return this.#messages[this.#messages.length].toString()
  }
  getFirstMessage(){
    return this.#messages[this.#messages.length]
  }
  getMessageHistory(){
    let messages = this.#messages.slice()
    messages.reverse()
    return messages
  }
  getShownMessages(){
    return this.getMessageHistory().map(x => x.time > 0?x:null).filter(x=>(x!=null)?x:undefined)
  }
  tickMessageTimes(){
    for(let msg of this.#messages){
      if(msg.time > 0){
        msg.time --
      }
    }
  }
  sendMessage(message = ConsoleMessage.Blank.create()){
    this.#messages.push(message)
  }
  sendText(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Default))
  }
  log(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Normal))
  }
  warn(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Warning))
  }
  error(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Error))
  }
  pushToConsole(){
    for(let msg of this.#messages){
      console.log(msg.toString())
    }
  }
}

const BMDConsole = new InGameConsole();
BMDConsole.pushToConsole();

function handleErrors(fn){
  try{
    fn();
  }
  catch(e){
    BMDConsole.error(e);
    for(let line of e.stack.split("\n").slice(1)){
      let parts = line.split("(")
      let file = parts.at(-1).split("/").at(-1)
      BMDConsole.error(parts[0] + "(" + file);
    }
    console.error(e)
    noLoop()
  }
}

function renderConsole(x, y, horizontalAlign){
  push();
  rectMode(CENTER);
  noStroke();
  textAlign(horizontalAlign, CENTER);
  let showX = x, showY = y;
  const messages = BMDConsole.getShownMessages();
  for(let msg of messages){
    const ttext = msg.toString();
    textSize(15);
    fill(...msg.getColour(), 100 * (msg.time<120?(msg.time/120):1));
    rect((horizontalAlign === RIGHT)?(showX - textWidth(ttext)/2):((horizontalAlign === LEFT)?(showX + textWidth(ttext)/2):showX), showY, textWidth(ttext) + 20, textSize() + 10);
    fill(...msg.getTextColour(), 255 * (msg.time<120?(msg.time/120):1));
    text(ttext, showX, showY);
    showY -= textSize() + 15;
  }
  BMDConsole.tickMessageTimes();
  pop();
}