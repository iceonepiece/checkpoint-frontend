"use client";

import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { useState, useEffect } from "react";

async function loadOBJ(url: string) {
  return new Promise<THREE.Object3D>((resolve, reject) => {
    new OBJLoader().load(url, resolve, undefined, reject);
  });
}

async function loadOBJWithMTL(objUrl: string, mtlUrl: string) {
    return new Promise<THREE.Object3D>((resolve, reject) => {
      const mtlLoader = new MTLLoader();
  
      mtlLoader.load(mtlUrl, (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
  
        objLoader.load(
          objUrl,
          (obj) => resolve(obj),
          undefined,
          (err) => reject(err)
        );
      });
    });
  }

type ViewerProps = {
  url: string;
  mtlUrl?: string;
  ext?: string;
  onThumbnail?: (png: string) => void;
};

function ModelFitAndCapture({ url, mtlUrl, ext, onThumbnail }: ViewerProps) {
  const { gl, camera, scene: threeScene } = useThree();
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    const fileExt = ext?.toLowerCase();

    async function load() {
        let obj: THREE.Object3D;
        
        /*
        if (fileExt === "glb" || fileExt === "gltf") {
            const gltf = await useGLTF(url);
            obj = gltf.scene.clone();
        }
            */
        if (fileExt === "obj") {
            if (mtlUrl) obj = await loadOBJWithMTL(url, mtlUrl);
            else obj = await loadOBJ(url);
        }
        else {
            console.error("Unsupported 3D format:", fileExt);
            return;
        }

        setModel(obj);
    }

    try {
        load();
    } catch (err) {
        console.error(err);
    }
  }, [url]);

  useEffect(() => {
    if (!model) return;

    // Fit model
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.15;

    camera.position.set(distance, distance * 0.8, distance);
    camera.lookAt(0, 0, 0);

    threeScene.add(model);

    requestAnimationFrame(() => {
      gl.render(threeScene, camera);
      const png = gl.domElement.toDataURL("image/png");
      onThumbnail?.(png);
    });
  }, [model]);

  return null;
}

export default function ThreeModelViewer({ url, ext, onThumbnail }: ViewerProps) {
  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true }}
      camera={{ fov: 45 }}
      style={{
        width: "100%",
        height: "100%",
        background: "#31363F",
      }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight intensity={1.0} position={[2, 2, 3]} />
      <directionalLight intensity={0.6} position={[-3, 1, 2]} />
      <directionalLight intensity={0.8} position={[0, 3, -3]} />

      <ModelFitAndCapture url={url} ext={ext} onThumbnail={onThumbnail} />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
