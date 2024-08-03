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
  /**
   * Get the default console message for this type. Message content will be empty.
   * @returns Default console message.
   */
  getDefaultMessage(){
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
  /**
   * Creates a copy of this message, and returns it.
   * @returns The copy of the message.
   */
  create(){
    return new ConsoleMessage(this.#content, this.#type)
  }
  /**
   * Gets the background colour of this message's type.
   * @returns Array of RGB values, 0-255.
   */
  getColour(){
    return this.#type.colour
  }
  /**
   * Gets the text colour of this message's type.
   * @returns Array of RGB values, 0-255.
   */
  getTextColour(){
    return this.#type.textColour
  }
  /**
   * Changes the type of this message. This mutates the original message.
   * @param {MessageType} newType Type to change to.
   */
  changeType(newType){
    this.#type = (newType instanceof MessageType)?newType:MessageType.Default
  }
  /**
   * Changes the type of this message. This does not mutate the original message, and instead returns a copy with a different type.
   * @param {MessageType} newType Type to change to.
   * @returns The message, with the new type.
   */
  withType(newType){
    return new ConsoleMessage(this.#content, (newType instanceof MessageType)?newType:MessageType.Default)
  }
  /**
   * Concatenates 2 console messages. The type of the resultant message will be the type of this message. This method returns a new message, and doesn't change either of the originals.
   * @param {ConsoleMessage} other Message to append.
   * @returns Message combining the contents of the 2 messages.
   */
  concat(other){
    return new ConsoleMessage(this.#content + other.#content, this.#type)
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
  /**
   * Get the text of the most recent message in the console's history.
   * @returns {string} The text of the first message.
   */
  getFirstText(){
    return this.#messages[this.#messages.length].toString()
  }
  /**
   * Get the most recent message in the console's history.
   * @returns {ConsoleMessage} The message.
   */
  getFirstMessage(){
    return this.#messages[this.#messages.length]
  }
  /**
   * Get a copy of the console's entire history, ordered from most recent to least recent.
   * @returns {ConsoleMessage[]} The console's history.
   */
  getMessageHistory(){
    let messages = this.#messages.slice()
    messages.reverse()
    return messages
  }
  /**
   * Get a copy of the console's history, ordered from most recent to least recent, excluding any messages which have expired.
   * @returns {ConsoleMessage[]} The console's history, filtered to remove expired messages.
   */
  getShownMessages(){
    return this.getMessageHistory().map(x => x.time > 0?x:null).filter(function(x){if(x != null && x instanceof ConsoleMessage) return x})
  }
  /**
   * Ticks each message in this console's history, reducing `time` by 1 each call.
   */
  tickMessageTimes(){
    for(let msg of this.#messages){
      if(msg.time > 0){
        msg.time --
      }
    }
  }
  /**
   * Adds a message to this console's history.
   * @param {ConsoleMessage} message Message to send.
   */
  sendMessage(message = ConsoleMessage.Blank.create()){
    this.#messages.push(message)
  }
  /**
   * Adds a message with type `MessageType.Default` to this console's history, with the specified text.
   * @param {string} text Text of message to send.
   */
  sendText(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Default))
  }
  /**
   * Adds a message with type `MessageType.Normal` to this console's history, with the specified text.
   * @param {string} text Text of message to send.
   */
  log(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Normal))
  }
  /**
   * Adds a message with type `MessageType.Warning` to this console's history, with the specified text.
   * @param {string} text Text of message to send.
   */
  warn(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Warning))
  }
  /**
   * Adds a message with type `MessageType.Error` to this console's history, with the specified text.
   * @param {string} text Text of message to send.
   */
  error(text = ""){
    this.sendMessage(new ConsoleMessage(text, MessageType.Error))
  }
  /**
   * Pushes the console's entire history to the built-in console (`stdout`), starting with the oldest.
   */
  pushToConsole(){
    for(let msg of this.#messages){
      console.log(msg.toString())
    }
  }
}

const BMDConsole = new InGameConsole();
BMDConsole.pushToConsole();

/**
 * Tries to execute a function, and sends any errors to an in-game console.
 * @param {Function} fn Function to try.
 * @param {InGameConsole} [consoleToUse=BMDConsole] Console to send errors to. Defaults to `BMDConsole`.
 * @param {boolean} stop If true, p5's draw() function will be stopped, so nothing more will happen.
 */
function handleErrors(fn, consoleToUse = BMDConsole, stop = true){
  try{
    fn();
  }
  catch(e){
    consoleToUse.error(e);
    for(let line of e.stack.split("\n").slice(1)){
      let parts = line.split("(")
      let file = parts.at(-1).split("/").at(-1)
      consoleToUse.error(parts[0] + "(" + file);
    }
    console.error(e)
    if(stop) noLoop() //stop p5
  }
}

/**
 * Renders a console's history as a list. Also ticks message times.
 * @param {number} x Offset from the left of the screen to draw at.
 * @param {number} y Offset from the top of the screen to draw at.
 * @param horizontalAlign Either `CENTER`, `LEFT`, `RIGHT` => `x` designates either the middle, the left or right.
 * @param {InGameConsole} [consoleToUse=BMDConsole] The console to render.
 */
function renderConsole(x, y, horizontalAlign, consoleToUse = BMDConsole){
  push();
  rectMode(CENTER);
  noStroke();
  textAlign(horizontalAlign, CENTER);
  let showX = x, showY = y;
  const messages = consoleToUse.getShownMessages();
  for(let msg of messages){
    const ttext = msg.toString();
    textSize(15);
    fill(...msg.getColour(), 100 * (msg.time<120?(msg.time/120):1));
    rect((horizontalAlign === RIGHT)?(showX - textWidth(ttext)/2):((horizontalAlign === LEFT)?(showX + textWidth(ttext)/2):showX), showY, textWidth(ttext) + 20, textSize() + 10);
    fill(...msg.getTextColour(), 255 * (msg.time<120?(msg.time/120):1));
    text(ttext, showX, showY);
    showY -= textSize() + 15;
  }
  consoleToUse.tickMessageTimes();
  pop();
}