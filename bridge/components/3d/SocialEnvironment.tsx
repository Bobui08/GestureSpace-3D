import React, { useMemo } from "react";
import { Billboard, Plane, Sky, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { getImagePath } from "../../data/gameData";

const posterData = [
  {
    label: "1954-1960",
    title: "Giu luc luong, xay nen",
    file: "Miền Bắc xây dựng chủ nghĩa xã hội.webp",
    position: [-10, 3.4, -8] as [number, number, number],
  },
  {
    label: "1961-1963",
    title: "Pha Chien tranh dac biet",
    file: "Phong trào Đồng khởi miền Nam 1960.jpg",
    position: [0, 3.4, -9] as [number, number, number],
  },
  {
    label: "1964-1965",
    title: "Chong leo thang chien tranh",
    file: "Chiến tranh leo thang.jpg",
    position: [10, 3.4, -8] as [number, number, number],
  },
];

const Poster = ({
  texture,
  label,
  title,
  position,
}: {
  texture: THREE.Texture;
  label: string;
  title: string;
  position: [number, number, number];
}) => (
  <group position={position}>
    <Plane args={[5.2, 3.1]}>
      <meshStandardMaterial map={texture} metalness={0.05} roughness={0.8} />
    </Plane>
    <Plane args={[5.4, 3.3]} position={[0, 0, -0.03]}>
      <meshStandardMaterial color="#0f172a" />
    </Plane>
    <Text position={[0, -2, 0]} fontSize={0.25} color="#bae6fd" anchorX="center">
      {label}
    </Text>
    <Text position={[0, -2.35, 0]} fontSize={0.2} color="#cbd5e1" anchorX="center">
      {title}
    </Text>
  </group>
);

const SocialEnvironment = () => {
  const mapTexture = useTexture(getImagePath("bản đồ việt nam.jpg"));
  const posterTextures = useTexture(
    useMemo(() => posterData.map((item) => getImagePath(item.file)), [])
  ) as THREE.Texture[];

  mapTexture.colorSpace = THREE.SRGBColorSpace;
  mapTexture.anisotropy = 8;

  posterTextures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  });

  return (
    <group>
      <Sky
        sunPosition={[70, 35, 30]}
        turbidity={1}
        rayleigh={0.6}
        mieCoefficient={0.005}
        mieDirectionalG={0.82}
      />

      <ambientLight intensity={0.62} />
      <directionalLight position={[20, 34, 16]} intensity={1.1} castShadow />
      <pointLight position={[0, 10, -3]} intensity={0.45} color="#22d3ee" />

      <Plane args={[180, 180]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#334155" roughness={1} />
      </Plane>

      <Plane args={[20, 12]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial map={mapTexture} roughness={0.9} metalness={0.02} />
      </Plane>

      {posterData.map((item, idx) => (
        <Poster
          key={item.file}
          texture={posterTextures[idx]}
          label={item.label}
          title={item.title}
          position={item.position}
        />
      ))}

      <Billboard position={[0, 6.4, 0]}>
        <Text
          fontSize={0.65}
          color="#f8fafc"
          anchorX="center"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          REVOLUTION NETWORK
        </Text>
        <Text position={[0, -0.85, 0]} fontSize={0.28} color="#bae6fd" anchorX="center">
          Lan tỏa mạng lưới cách mạng 1954-1965
        </Text>
      </Billboard>
    </group>
  );
};

export default SocialEnvironment;
