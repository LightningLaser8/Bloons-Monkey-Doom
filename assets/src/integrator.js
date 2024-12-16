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
import * as Integrate from "../../lib/integrate/integrate.js";
import * as classes from "./classes.js";
import * as reg from "./registry/registries.js";
import * as vfx from "./registry/vfx.js";
function setupIntegrate() {
  Integrate.addModdableRegistry(reg.bloonRegistry, "bloons");
  Integrate.addModdableRegistry(reg.mapRegistry, "maps");
  Integrate.addModdableRegistry(reg.effectRegistry, "vfx");
  Integrate.addModdableRegistry(reg.statusRegistry, "statuses");
  Integrate.addModdableRegistry(reg.towerRegistry, "towers");
  Integrate.types.add("Tower", classes.Tower);
  Integrate.types.add("BloonType", classes.BloonType);
  Integrate.types.add("VisualEffect", vfx.VisualEffect);
  Integrate.types.add("ParticleEffect", vfx.ParticleEffect);
  Integrate.types.add("WaveParticleEffect", vfx.WaveParticleEffect);
  Integrate.types.add("MultiEffect", vfx.MultiEffect);
  Integrate.setPrefix(true);
}
function loadMods(){
  console.log("Mods have not yet been implemented.")
}
export { setupIntegrate, loadMods };
//shut i'll do the actual bit later
