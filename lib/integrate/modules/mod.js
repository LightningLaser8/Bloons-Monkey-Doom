import { Content } from "./modcontent.js"

class Mod{
  /** Display name of the mod. */
  displayName = "Mod"
  /** Internal ID for the mod. Used for registry items. */
  name = "mod"
  /** Mod version. */
  version = "v0.0.0"
  /** Who made this mod. */
  author = "unknown"
  /** Short, one-line description of the mod. */
  tagline = ""
  /** Longer description of the mod. */
  description = ""
  /** Array of all content in this mod. @type {Content[]} */
  content = []
}
export { Mod }