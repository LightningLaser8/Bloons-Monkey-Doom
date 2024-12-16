# Integrate

A library for mod loading into serialisable registries.

## Terminology

- A _registry_ is a data structure for holding case-insensitive key-value pairs. Simply, it matches names to objects, without caring about capitalisation. They are instances of `Integrate.Registry`.
- *Registry name*s are string locations of an item in a _registry_.
- *Constructible object*s are basic objects with a `type` property, holding a _registry name_ of a class.
- _Content_ refers to any constructible object with a registry name, defined by the mod. Any content is an instance of `Integrate.Content`.
- A _mod_ is a directory of files, each one adding _content_.
- A _content file_ is a JSON file holding a _constructible object_.

## Example (JS)

_Adding Integrate mods to your project_

```js
//Import Integrate
import * as Integrate from "../integrate.js";
//"Game" Setup
Integrate.types.add("entity", class Entity {});
Integrate.types.add("block", class Block {});
Integrate.types.add("item", class Item {});

//Modloader Setup
let content = new Integrate.Registry();
Integrate.addModdableRegistry(content, "content");
Integrate.setPrefix(true);

//Tests
Integrate.add("./mod").then(() => content.forEach(x => console.log(Integrate.construct(x))));
```

On load, logs:

```
> Block {type: "block", width: 20, height: 20, health: 200}
```

## Example (Directory)

_The directory structure for Integrate mods_

```
(mod root)
 |-> mod.json
 |-> definition file
 |=> (content)
```

### mod.json

Holds the basic information for the mod:

```json
{
  "name": "example",
  "displayName": "Example Mod",
  "definitions": "./definitions.json",
  "tagline": "Basic mod to show functionality.",
  "description": "This mod exists only to show functionality of the modloader, and is not intended to be played with in any game. It is purely for demonstrative purposes.",
  "author": "LightningLaser8",
  "version": "v0.1.0"
}
```

`name` defines the _mod identifier_ - a string used to differentiate this mod's content form another's.  
`displayName` defines the name shown, both in info and possibly other parts of the program.  
`tagline` defines a _short_ description of the mod, usually a single line.  
`description` defines a longer description, which can be multiple lines, and should describe the type of content, or the premise of the mod.  
`author` defines the name that should be shown to have made the mod.  
`version` defines the _mod's version_, should be used to detect updated mods in saves, for example.

`definitions` gives the path _from the mod.json file_ to the dfinition file.

### Definition File

This is the most important file in any Integrate mod, defining paths and registry names of _content_.

```json
[
  {
    "path": "./wall.json",
    "name": "wall",
    "registry": "content"
  }
]
```

It consists of a _single array_, each entry being an object with these three properties:  
`path` defining the _relative location_ of the _content file_ being described.  
`name` being the _registry name_ of this content.  
`registry` being optional, defining the registry this content will be added to. By default, this will be `"content"`. **This registry does not exist by default, and will throw errors if not defined.**

### Content Files

These describe the actual content itself, not metadata.

```json
{
  "type": "block",
  "width": 20,
  "height": 20,
  "health": 200
}
```

`type` is mandatory, it defines the _registry name_ of the class this object will be an instance of.  
`width`, `height` and `health` are specific to this type, and are not necessary in content files. They are properties of the class stored at `"block"` in the Registry `Integrate.types`.

## Interface

Integrate has several functions to customise modloading, which are documented here.

### Integrate.add()

`Integrate.add()` loads, constructs and implements a mod all in one go.

```ts
Integrate.add(path: string): void
```

`path` is the relative path from the current window location to the mod's _root directory_, **not** the mod.json.

### Integrate.load()

`Integrate.load()` loads a mod from a path, and returns the `Integrate.Mod` object.

```ts
Integrate.load(path: string): Integrate.Mod
```

`path` is the relative path from the current window location to the mod's _root directory_, **not** the mod.json.  
Returns an `Integrate.Mod` object, holding all the info about the imported mod. Once loaded, this object is all that's needed.

### Integrate.addModdableRegistry()

`Integrate.addModdableRegistry()` adds a registry to the list of modifiable registries. This list defines which registries mods can add content to.

```ts
Integrate.addModdableRegistry(reg: Integrate.Registry, name: string): void
```

`reg` is the `Integrate.Registry` (or similar implementing the same methods) to allow modification of.  
`name` is the string that this registry will be referred to by.

### Integrate.setPrefix()

`Integrate.setPrefix()` changes whether or not mod content's registry names should be prefixed with the mod's `name`.

```ts
Integrate.setPrefix(value: boolean): void
```

`value` is the new Boolean value of this flag. `true` means prefixes on, `false` means prefixes off. By default this is `false`.

### Integrate.setInfoOutput()

`Integrate.setInfoOutput()` changes the way Integrate shows status messages.

```ts
Integrate.setInfoOutput(func: (info: string) => void): void
```

`func` callback for each status message. THe parameter `info` contains the message, as a string. By default, this function is `console.log`.

### Integrate.types
`Integrate.types` is an `Integrate.Registry` holding all types mod content can be an instance of.
```ts
Integrate.types: Integrate.Registry
```

### Integrate.construct()
`Integrate.construct()` is a helpful function that combines `Integrate.Registry.create()` and `Integrate.Registry.construct` for mod content.
```ts
Integrate.construct(object: object | string, defaultType: class): object
```
`object` is either a constructible object, or a registry name of one in any moddable registry.  
`defaultType` is an optional parameter defining a fallback type for if the constructible has no `type` property.

## Classes

### Integrate.Content

```ts
class Content {
  registry: string;
  name: string;
  constructible: object;
  JSON: string;
  implement() {}: void
  create() {}: object
}
```

`registry` Name of the registry this content is to be added to.
`name` Name of this content in registry.  
`constructible` The JSON serialisable constructible object used to create instances of this content.  
`JSON` The JSON equivalent of the constructible.  
`implement()` Adds this content to its designated registry.
`create()` Returns a constructed instance of this content directly.

### Integrate.Mod

```ts
class Mod {
  displayName: string;
  name: string;
  version: string;
  author: string;
  tagline: string;
  description: string;
  content: Content[];
}
```

`displayName` Display name of the mod.  
`name` Internal ID for the mod. Used for registry items.  
`version` Mod version.  
`author` Who made this mod.  
`tagline` Short, one-line description of the mod.  
`description` Longer description of the mod.  
`content` Array of all content in this mod.

### Integrate.Registry

```ts
/**
 * Data structure for holding **unique, case-insensitive** key-value pairs.
 */
class Registry {
  get size() {}: number;
  add(name: string, item: any) {}: void;
  has(name: string) {}: boolean;
  get(name: string) {}: object;
  create(name: string, registry: Integrate.Registry, defaultType: class) {}: object;
  construct(object: object, defaultType: class) {}: object;
  rename(name: string, newName: string) {}: void;
  alias(name: string, as: string) {}: void;
  forEach(func: (item, name: string) => void) {}: void;
  nameOf(item: any) {}: string | null;
}
```

`size` Returns the size of the registry.  
`add()` Adds an item to registry.  
`has()` Checks for an item in registry.
`get()` Gets an item from registry name.  
`create()` Constructs an item from registry. Note that this only works with objects. The parameter `registry` should be the registry holding all types, such as `Integrate.types`.  
`construct()` Constructs an item using a type from registry. Note that this only works with object entries.  
`rename()` Renames a registry item. Neither parameter is case-sensitive.  
`alias()` Adds another registry item with the same content as the specified one.  
`forEach()` Executes a function for each element in the registry.  
`nameOf()` Searches the registry for any entries with matching content. Equivalence follows `===` rules.
