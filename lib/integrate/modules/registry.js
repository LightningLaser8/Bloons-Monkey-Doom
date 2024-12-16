/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 */
class Registry {
  ///Internal Map for holding the registry items.
  #content = new Map();
  get size() {
    //Get size of the internal Map.
    return this.#content.size;
  }
  /** Adds an item to registry.
   * @param {string} name Registry name of item. This is not case sensitive.
   * @param {*} item Item to add to registry.
   */
  add(name, item) {
    if (!name) return; //catch empty name
    if (!item) return; //catch null items
    if (typeof name !== "string") name = name.toString(); //Stringify name
    name = name.toLowerCase(); //Remove case sensitivity.
    //Throw an error if the item already exists.
    if (this.has(name))
      throw new SyntaxError(
        "Item " +
          name +
          " already exists in registry! Consider using a different name."
      );
    //Add to internal Map
    this.#content.set(name, item);
  }
  /**
   * Checks for an item in registry.
   * @param {string} name Registry name to check for. Not case sensitive.
   * @returns Whether or not the name exists.
   */
  has(name) {
    if (typeof name !== "string") name = name.toString(); //Stringify name
    name = name.toLowerCase(); //Remove case sensitivity.
    //Return presence
    return this.#content.has(name);
  }
  /**
   * Gets an item from registry name.
   * @param {string} name Registry name to get. Not case sensitive.
   * @returns The item, if present.
   */
  get(name) {
    if (typeof name !== "string") name = name.toString(); //Stringify name
    name = name.toLowerCase(); //Remove case sensitivity.
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Return item, if it exists.
    return this.#content.get(name);
  }
  /**
   * Constructs an item from registry. Note that this only works with objects.
   * @param {string} name Name of item to construct.
   * @param {Registry} registry Registry for the type of the item.
   * @param {Function} [defaultType=Object] Constructor function or class to use if there's no defined type.
   */
  create(name, registry, defaultType = Object) {
    return this.#construct(this.get(name), registry, defaultType);
  }
  /**
   * Constructs an item using a type from registry. Note that this only works with objects.
   * @param {object} object Object to construct.
   * @param {Function} [defaultType=Object] Constructor function or class to use if there's no defined type.
   */
  construct(object, defaultType = Object) {
    return this.#construct(object, this, defaultType);
  }
  #construct(object, registry, defaultType = Object) {
    if (!object) return; //Catch accidental calls using null, undefined or similar
    //Constructs an instance using type from registry, if it exists. If not, throw error.
    //If type is undefined, use the default.
    let instantiated = new (
      object.type ? registry.get(object.type) : defaultType
    )();
    let cloned = {};
    //Clone the object if possible, to copy stuff like bullet drawers, or weapon.shoot.pattern. If it fails, just use the original.
    try {
      cloned = structuredClone(object);
    } catch (error) {
      cloned = object;
      console.warn("Could not clone object:", error);
    }
    checkForClashingFunctions(cloned, instantiated)
    instantiated = Object.assign(instantiated, cloned);
    instantiated.init ? instantiated.init() : {}; //Initialise if possible.
    return instantiated;
  }
  /**
   * Renames a registry item. Neither parameter is case-sensitive.
   * @param {string} name Registry name to change.
   * @param {string} newName What to change the name to.
   */
  rename(name, newName) {
    if (typeof name !== "string") name = name.toString(); //Stringify name
    name = name.toLowerCase(); //Remove case sensitivity.
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Get entry
    let current = this.get(name);
    //Remove current entry
    this.#content.delete(name);
    //Add new entry
    this.add(newName, current);
  }
  /**
   * Adds another registry item with the same content as the specified one.
   * @param {string} name Registry name to change.
   * @param {string} as What to change the name to.
   */
  alias(name, as) {
    if (typeof name !== "string") name = name.toString(); //Stringify name
    name = name.toLowerCase(); //Remove case sensitivity.
    //Throw an error if the item doesn't exist.
    if (!this.has(name))
      throw new ReferenceError(
        "Item " +
          name +
          " does not exist in registry! Consider checking your spelling."
      );
    //Get current entry
    let current = this.get(name);
    //Add new entry with the same content
    this.add(as, current);
  }
  /**
   * Executes a function for each element in the registry.
   * @param {(item, name: string) => void} func Callback for each element.
   */
  forEach(func) {
    this.#content.forEach((element, name) => {
      void func(element, name);
    });
  }
  *[Symbol.iterator]() {
    for (let item of this.#content.values()) {
      yield item;
    }
  }
  /**
   * Searches the registry for any entries with matching content. Equivalence follows `===` rules.
   * @param {*} item Item to search for.
   * @returns {string | null} Null if no entry with the item exists, the corresponding name otherwise.
   */
  nameOf(item) {
    let found = null;
    this.forEach((ritem, name) => {
      if (ritem === item) found = name;
    });
    return found;
  }
  /**
   * Returns an array of every item name in the registry.
   */
  getKeys(){
    return [...this.#content.keys()]
  }
}

function checkForClashingFunctions(source, target){
  for(let prop in source){
    if(prop in target){
      if(typeof target[prop] === "function"){
        throw new SyntaxError("Property '"+prop+"' clashes with a class method!")
      }
    }
  }
}

export { Registry };