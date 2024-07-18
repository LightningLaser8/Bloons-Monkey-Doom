class Registry {
  #registry = {};
  name = "Registry";
  constructor(name) {
    this.name = name;
  }
  /** Adds an item to the registry.
   * @param {string} name Registry name of the item.
   * @param {*} item Item to add.
   */
  add(name, item) {
    Object.defineProperty(this.#registry, name, {
      value: item,
      writable: false,
      enumerable: true,
      configurable: false
    });
  }
  /** Returns a registered item.
   * @param {string} name Registry name to get.
   */
  get(name) {
    if (this.#registry[name] == null) {
      console.warn(
        "Item '" +
          name +
          "' does not exist in registry for " +
          this.name
      );
    }
    return this.#registry[name] ?? null;
  }
  /**
   * Checks if an item exists in registry.
   * @param {string} name Registry name to check for
   */
  has(name) {
    return name in this.#registry;
  }
  /** Does something for each item in registry. 
   * @param {Function} callback Function to call on each item.
   */
  forEach(callback){
    for(const itemName in this.#registry){
      const item = this.#registry[itemName]
      callback(item)
    }
  }
}

const statusRegistry = new Registry("Status Effects");
const mapRegistry = new Registry("Maps");
//const bloonRegistry = new Registry("Bloons");
//const effectRegistry = new Registry("Visual Effects");
//const towerRegistry = new Registry("Towers");
