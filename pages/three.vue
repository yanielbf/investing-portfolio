<script setup>
import * as THREE from "three";

const scene1 = new THREE.Scene();

const part1 = ref();
const part2 = ref();
const part3 = ref();
const mats = ref({});

async function handler() {
  const { nodes: part1 } = await useGLTF("/3dmodel/cover/1.glb", {
    draco: true,
  });
  const { nodes: part2 } = await useGLTF("/3dmodel/cover/2.glb", {
    draco: true,
  });
  const { nodes: part3 } = await useGLTF("/3dmodel/cover/3.glb", {
    draco: true,
  });

  const group = new THREE.Group();
  group.add(part1.mesh_0);
  group.add(part2.mesh_0);
  group.add(part3.mesh_0);
  scene1.add(group);

  console.log(group);
  // scene1.remove(scene1.children[0]);
}

async function handler2() {
  const { nodes } = await useGLTF("/3dmodel/cover/Render2.glb", {
    draco: true,
  });
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  group.add(nodes.Carcasa_basica037);
  group.add(nodes.Carcasa_basica037_1);
  group.add(nodes.Carcasa_basica037_2);
  scene1.add(group);
  //console.log(nodes);
  console.log(group);
  part1.value = nodes.Carcasa_basica037;
}

function handler3() {
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  console.log(toRaw(part1.value));
  group.add(toRaw(part1.value));
  group.add(toRaw(part2.value));
  group.add(toRaw(part3.value));
  scene1.add(group);
}

function handler4() {
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  const meshCover = toRaw(part1.value);
  console.log(meshCover);
  var color = new THREE.Color(Math.random(), Math.random(), Math.random());
  var material = new THREE.MeshBasicMaterial({ color: color });
  meshCover.material = material;
  group.add(meshCover);
  group.add(toRaw(part2.value));
  group.add(toRaw(part3.value));
  scene1.add(group);
}

function handler5() {
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  const meshCover = toRaw(part1.value);
  meshCover.material = toRaw(mat3.value);
  group.add(meshCover);
  group.add(toRaw(part2.value));
  group.add(toRaw(part3.value));
  scene1.add(group);
}

function changeMaterialCover(name) {
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  const meshCover = toRaw(part1.value);
  meshCover.material = toRaw(mats.value[name]);
  group.add(meshCover);
  group.add(toRaw(part2.value));
  group.add(toRaw(part3.value));
  scene1.add(group);
}

function changeMaterialButtons(name) {
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  const meshCover = toRaw(part2.value);
  meshCover.material = toRaw(mats.value[name]);
  group.add(meshCover);
  group.add(toRaw(part1.value));
  group.add(toRaw(part3.value));
  scene1.add(group);
}

function changeMaterialCameraHole(name) {
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  const meshCover = toRaw(part3.value);
  meshCover.material = toRaw(mats.value[name]);
  group.add(meshCover);
  group.add(toRaw(part1.value));
  group.add(toRaw(part2.value));
  scene1.add(group);
}

onMounted(async () => {
  const { nodes, materials } = await useGLTF("/3dmodel/cover/Render2.glb", {
    draco: true,
  });
  console.log(materials);
  part1.value = nodes.Carcasa_basica037;
  part2.value = nodes.Carcasa_basica037_1;
  part3.value = nodes.Carcasa_basica037_2;
  mats.value = materials;
  scene1.remove(scene1.children[0]);
  const group = new THREE.Group();
  group.add(nodes.Carcasa_basica037);
  group.add(nodes.Carcasa_basica037_1);
  group.add(nodes.Carcasa_basica037_2);
  scene1.add(group);
});
</script>

<template>
  <div class="grid grid-rows-[50vh_1fr]">
    <TresCanvas clear-color="#eee" preset="realistic">
      <TresPerspectiveCamera :position="[3, 2, -380]" />
      <OrbitControls />
      <Suspense>
        <primitive :object="scene1" />
      </Suspense>
      <TresDirectionalLight :intensity="2" :position="[3, 3, 3]" />
      <TresAmbientLight :intensity="1" />
    </TresCanvas>
  </div>
  <div class="flex gap-2 mt-3">
    <div @click="handler">111</div>
    <div @click="handler2">222</div>
    <div @click="handler3">333</div>
    <div @click="handler4">444</div>
    <div @click="handler5">555</div>
  </div>
  <div class="mt-3">
    <div class="font-semibold">Cover</div>
    <div class="flex gap-2">
      <div
        @click="changeMaterialCover(item)"
        v-for="item in Object.keys(mats)"
        :key="item"
      >
        {{ item }}
      </div>
    </div>
  </div>
  <div class="mt-3">
    <div class="font-semibold">Botones</div>
    <div class="flex gap-2 mt-3">
      <div
        @click="changeMaterialButtons(item)"
        v-for="item in Object.keys(mats)"
        :key="item"
      >
        {{ item }}
      </div>
    </div>
  </div>
  <div class="mt-3">
    <div class="font-semibold">Camara</div>
    <div class="flex gap-2 mt-3">
      <div
        @click="changeMaterialCameraHole(item)"
        v-for="item in Object.keys(mats)"
        :key="item"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
