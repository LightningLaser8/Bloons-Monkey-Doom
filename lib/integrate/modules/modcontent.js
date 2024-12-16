import { Registry } from "./registry.js";
import { types, registries } from "./environment.js";

//Content
class Content {
  /** Name of the registry this content is to be added to. */
  registry = "content";
  /** Name of this content in registry. */
  name = "thing";
  /** The JSON serialisable constructible object used to create instances of this content. */
  constructible = {};
  /** The JSON equivalent of the constructible. */
  JSON = "{}";
  implement() {
    //Add the stuff
    registries.get(this.registry).add(this.name, this.constructible);
  }
  create() {
    return types.construct(this.constructible);
  }
}

//Manipulation and Exports
/**
 * Allows mods to modify a registry, by using a certain name.
 * @param {Registry} reg Registry to add.
 * @param {string} name Name of the registry, to be used in mod content.
 */
function addModdableRegistry(reg, name) {
  //Funny, isn't it?
  registries.add(name, reg);
}
export { Content, addModdableRegistry };
