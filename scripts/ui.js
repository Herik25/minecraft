import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { blocks, resources } from "./blocks";

export function createUI(world) {
  const gui = new GUI();
  gui.add(world.size, "width", 1, 128, 1).name("Width");
  gui.add(world.size, "height", 1, 128, 1).name("Height");
  const terrainFolder = gui.addFolder("Terrain");
  terrainFolder.add(world.params, "seed", 0, 10000, 1).name("Seed");
  terrainFolder.add(world.params.terrain, "scale", 1, 100, 1).name("Scale");
  terrainFolder
    .add(world.params.terrain, "magnitute", 0.1, 2, 0.1)
    .name("Magnitute");
  terrainFolder.add(world.params.terrain, "offset", -1, 1, 0.1).name("Offset");

  const resourcesFolder = gui.addFolder("Resources");

  resources.forEach((resource) => {
    const resourceFolder = resourcesFolder.addFolder(resource.name);
    resourceFolder
      .add(resource, "scarcity", 0, 1, 0.01)
      .name(`${resource.name} Scarcity`);
    resourceFolder.add(resource.scale, "x", 10, 100).name(`${resource.name} X`);
    resourceFolder.add(resource.scale, "y", 10, 100).name(`${resource.name} Y`);
    resourceFolder.add(resource.scale, "z", 10, 100).name(`${resource.name} Z`);
  });

  //   gui.add(world, "generate");
  gui.onChange(() => {
    world.generate();
  });
}
