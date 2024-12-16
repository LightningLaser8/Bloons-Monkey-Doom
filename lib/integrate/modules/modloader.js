import { Content } from "./modcontent.js";
import { getJSONFromFile } from "./get-json-file.js";
import { Mod } from "./mod.js";

let info = console.log;

const requiredContentProperties = ["type"];
let currentPath = window.location.href;
let prefix = false;

async function loadContentFile(path, name, registry) {
  info("Fetching content: "+name+" (at "+path+")")
  let obj = await getJSONFromFile(relativeURL(path));
  if (!obj)
    throw new ReferenceError(
      "Mod Ccntent file [at " + definitionPath + "] empty or not found."
    );
  let content = new Content();
  for (let prop of requiredContentProperties)
    if (obj[prop] == null)
      throw new SyntaxError("Mod content must define property: '" + prop + "'");
  content.constructible = obj;
  content.JSON = JSON.stringify(obj);
  content.name = name;
  content.registry = registry;
  info("Content fetched: ",content)
  return content;
}
/**
 * Loads an entire mod.
 * @param {string} path Path to a directory containing the mod.
 */
async function loadMod(path) {
  resetPath();
  //##### SETUP #####
  let root = relativeURL(path) + "/";
  let definitionPath = "";
  let mod = new Mod();

  info("|| LOADING MOD FROM " + root + " ||");
  try {
    //##### GET MOD #####

    let modJSON = await getJSONFromFile(root + "mod.json");
    if (!modJSON) throw new ReferenceError("Mod contains no mod.json!");
    info("| MOD IDENTIFIED: " + (modJSON.displayName ?? "Mod") + " |");

    //##### BASIC FEATURES #####
    info("| STAGE 1: DETAILS |");
    //No construct() here for security
    if (modJSON.name) mod.name = modJSON.name;
    else throw new SyntaxError('mod.json must define mod ID! ("name")');
    if (modJSON.displayName) mod.displayName = modJSON.displayName;
    if (modJSON.author) mod.author = modJSON.author;
    if (modJSON.version) mod.version = modJSON.version;
    if (modJSON.tagline) mod.tagline = modJSON.tagline;
    if (modJSON.description) mod.description = modJSON.description;
    if (modJSON.definitions) definitionPath = modJSON.definitions;
    else
      throw new SyntaxError(
        "mod.json must define the path to the definition file!"
      );

    //##### DEFINITIONS #####
    info("| STAGE 2: DEFINITIONS |");
    definitionPath = relativeURLFrom(root, definitionPath);
    let definitions = await getJSONFromFile(definitionPath);
    if (!definitions)
      throw new ReferenceError(
        "Definition file [at " + definitionPath + "] empty or not found."
      );
    if (!Array.isArray(definitions))
      throw new SyntaxError(
        "Definition file must contain only a single array."
      );

    let contents = [];
    for (let entry of definitions) {
      if (typeof entry !== "object")
        throw new SyntaxError("Content definitions must be objects.");
      if (!entry.path)
        throw new SyntaxError(
          "Content definitions must contain a path to the content."
        );
      contents.push(entry);
    }
    info("| STAGE 3: CONTENT |");
    for (const entry of contents) {
      let content = await loadContentFile(
        relativeURLFrom(definitionPath, entry.path),
        entry.name ?? "item",
        entry.registry ?? "content"
      );
      mod.content.push(content);
    }

    info("|| MOD LOADING SUCCESSFUL ||");
  } catch (e) {
    info("|| MOD LOADING FAILED ||");
    throw e;
  }
  return mod;
}
/**
 * Adds a mod to the program.
 * @param {Mod} mod Mod to add to the program.
 */
async function addMod(mod) {
  info("|| POST-LOADING MOD: " + mod.displayName + " ||");
  if (prefix) {
    info("| POST-LOAD: PREFIXES |");
    mod.content.forEach(
      (content) => (content.name = mod.name + ":" + content.name)
    );
  }
  info("| POST-LOAD: REGISTRY |");
  mod.content.forEach((content) => content.implement());
  info("|| POST-LOAD COMPLETE ||");

  info("|| MOD FULLY LOADED ||");
}

async function add(path) {
  return await addMod(await loadMod(path));
}

function relativeURL(path) {
  return new URL(path, currentPath).href;
}
function relativeURLFrom(currentPath, path) {
  return new URL(path, currentPath).href;
}
function resetPath() {
  currentPath = window.location.href;
}
/**
 * Sets the prefix mode for new items. `true` prefixes the mod's name to the item's registry name, `false` just adds it directly.
 * **By default, this is `false`.**
 * @param {boolean} value
 */
function setPrefix(value) {
  prefix = !!value;
}
/**
 * Sets a callback to define how the loader shows info text.
 * @param {(info: string) => void} func Callback to handle info text.
 */
function setInfoOutput(func) {
  if (typeof func !== "function")
    throw new TypeError("Cannot set info output to a non-function!");
  info = func;
}

export {
  loadMod as load,
  add,
  setPrefix,
  setInfoOutput,
};
