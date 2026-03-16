import * as THREE from "three";
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";
import { RNG } from "./rng";
import { blocks } from "./blocks";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial();
const matrix = new THREE.Matrix4();

export class World extends THREE.Group {
  /**
   * @type {{
   *  id: number;
   *  instanceId: number;
   * }[][][]}
   */

  data = [];
  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitute: 0.5,
      offset: 0.2,
    },
  };

  constructor(size = { width: 64, height: 32 }) {
    super();
    this.size = size;
  }

  generate() {
    this.initTerrain();
    this.generateTerrain();
    this.generateMeshes();
  }

  initTerrain() {
    this.data = [];
    for (let i = 0; i < this.size.width; i++) {
      const slice = [];
      for (let j = 0; j < this.size.height; j++) {
        const row = [];
        for (let k = 0; k < this.size.width; k++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  generateTerrain() {
    const rng = new RNG(this.params.seed);
    const simplex = new SimplexNoise(rng);
    for (let i = 0; i < this.size.width; i++) {
      for (let k = 0; k < this.size.width; k++) {
        const val = simplex.noise(
          i / this.params.terrain.scale,
          k / this.params.terrain.scale,
        );

        const scaleNoice =
          this.params.terrain.magnitute + this.params.terrain.offset * val;

        let height = Math.floor(scaleNoice * this.size.height);
        height = Math.max(0, Math.min(height, this.size.height - 1));

        for (let j = 0; j <= this.size.height; j++) {
          if (j <= height) {
            this.setBlockId(i, j, k, blocks.dirt.id);
          } else if (j === height + 1) {
            this.setBlockId(i, j, k, blocks.grass.id);
          } else {
            this.setBlockId(i, j, k, blocks.empty.id);
          }
        }
      }
    }
  }

  generateMeshes() {
    this.clear();
    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.size.width * this.size.height * this.size.width,
    );
    mesh.count = 0;

    for (let i = 0; i < this.size.width; i++) {
      for (let j = 0; j < this.size.height; j++) {
        for (let k = 0; k < this.size.width; k++) {
          const blockId = this.getBlock(i, j, k).id;
          const blockType = Object.values(blocks).find((b) => b.id === blockId);
          const instanceId = mesh.count;
          if (blockId !== 0 && !this.isBlockObscured(i, j, k)) {
            matrix.setPosition(i, j, k);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.setColorAt(instanceId, new THREE.Color(blockType.color));
            this.setInstanceId(i, j, k, instanceId);
            mesh.count++;
          }
        }
      }
    }
    this.add(mesh);
  }

  setInstanceId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = id;
    }
  }

  inBounds(x, y, z) {
    if (
      x >= 0 &&
      x < this.size.width &&
      y >= 0 &&
      y < this.size.height &&
      z >= 0 &&
      z < this.size.width
    ) {
      return true;
    } else {
      return false;
    }
  }

  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  }

  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  isBlockObscured(x, y, z) {
    const up = this.getBlock(x, y + 1, z)?.id ?? 0;
    const down = this.getBlock(x, y - 1, z)?.id ?? 0;
    const left = this.getBlock(x - 1, y, z)?.id ?? 0;
    const right = this.getBlock(x + 1, y, z)?.id ?? 0;
    const front = this.getBlock(x, y, z - 1)?.id ?? 0;
    const back = this.getBlock(x, y, z + 1)?.id ?? 0;

    if (
      up === 0 ||
      down === 0 ||
      left === 0 ||
      right === 0 ||
      front === 0 ||
      back === 0
    ) {
      return false;
    } else {
      return true;
    }
  }
}
