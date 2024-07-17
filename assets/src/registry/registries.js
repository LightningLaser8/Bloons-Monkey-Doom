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
    });
  }
  /** Returns a registered item.
   * @param {string} name Registry name to get.
   */
  get(name) {
    if (this.#registry[name] != null) {
      console.warn(
        "Item '" + this.#registry[name] + "' does not exist in registry for " + this.name
      );
    }
    return this.#registry[name] ?? null;
  }
  /**
   * Checks if an item exists in registry.
   * @param {string} name Registry name to check for
   */
  has(name){
    return (name in this.#registry)
  }
}

const statusRegistry = new Registry("Status Effects");
//const bloonRegistry = new Registry("Bloons");
//const effectRegistry = new Registry("Visual Effects");
//const towerRegistry = new Registry("Towers");
