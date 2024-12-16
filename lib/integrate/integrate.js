//Basics
import { add, load, setPrefix, setInfoOutput } from "./modules/modloader.js";
import { Registry } from "./modules/registry.js";
import { types } from "./modules/environment.js";
import { addModdableRegistry } from "./modules/modcontent.js";
import { Content } from "./modules/modcontent.js";
import { registries } from "./modules/environment.js";

export {
  Registry,
  Content,
  add,
  addModdableRegistry,
  load,
  setPrefix,
  setInfoOutput,
  types,
};

/**
 * Constructs an object using types from the `Integrate.types` registry.
 * @param {object | string} object Object to construct, or its registry name. Registry names will be searched for through any moddable registry, searching the first registry added first.
 * @param {function} defaultType Type to use if no other can be found.
 */
function construct(object, defaultType = Object) {
  if (typeof object === "string") {
    return constructObject(getFromAnyRegistry(object), defaultType)
  } else {
    return constructObject(object, defaultType);
  }
}
function getFromAnyRegistry(name) {
  for(let reg of registries){
    if(reg.has(name)) return reg.get(name);
  }
  reg.get(null)
}

function constructObject(object, defaultType = Object) {
  return types.construct(object, defaultType);
}
export { construct };
