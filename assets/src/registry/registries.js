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
    console.log("Added item '"+name+"' to registry for "+this.name)
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
    return this.#registry[name];
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
  getValues(){
    return Object.values(this.#registry)
  }
  getKeys(){
    return Object.keys(this.#registry)
  }
}

const statusRegistry = new Registry("Status Effects");
const mapRegistry = new Registry("Maps");
const bloonRegistry = new Registry("Bloons");
const effectRegistry = new Registry("Visual Effects");
const towerRegistry = new Registry("Towers");
