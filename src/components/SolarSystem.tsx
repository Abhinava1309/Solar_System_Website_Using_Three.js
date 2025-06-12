import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh, Group } from 'three';

interface PlanetData {
  name: string;
  size: number;
  distance: number;
  color: string;
  rotationSpeed: number;
  orbitSpeed: number;
  description: string;
  moons?: number;
}

const planetData: PlanetData[] = [
  {
    name: 'Mercury',
    size: 0.15,
    distance: 3,
    color: '#8C7853',
    rotationSpeed: 0.02,
    orbitSpeed: 0.04,
    description: 'The smallest planet and closest to the Sun',
    moons: 0
  },
  {
    name: 'Venus',
    size: 0.2,
    distance: 4,
    color: '#FFC649',
    rotationSpeed: -0.01,
    orbitSpeed: 0.035,
    description: 'The hottest planet with a toxic atmosphere',
    moons: 0
  },
  {
    name: 'Earth',
    size: 0.22,
    distance: 5,
    color: '#6B93D6',
    rotationSpeed: 0.02,
    orbitSpeed: 0.03,
    description: 'Our home planet, the only known planet with life',
    moons: 1
  },
  {
    name: 'Mars',
    size: 0.18,
    distance: 6.5,
    color: '#CD5C5C',
    rotationSpeed: 0.018,
    orbitSpeed: 0.024,
    description: 'The Red Planet, target for future human missions',
    moons: 2
  },
  {
    name: 'Jupiter',
    size: 0.8,
    distance: 10,
    color: '#D8CA9D',
    rotationSpeed: 0.04,
    orbitSpeed: 0.013,
    description: 'The largest planet, a gas giant with a great red spot',
    moons: 95
  },
  {
    name: 'Saturn',
    size: 0.7,
    distance: 14,
    color: '#FAD5A5',
    rotationSpeed: 0.038,
    orbitSpeed: 0.009,
    description: 'Famous for its beautiful ring system',
    moons: 146
  },
  {
    name: 'Uranus',
    size: 0.4,
    distance: 18,
    color: '#4FD0E7',
    rotationSpeed: 0.03,
    orbitSpeed: 0.006,
    description: 'An ice giant tilted on its side',
    moons: 27
  },
  {
    name: 'Neptune',
    size: 0.38,
    distance: 22,
    color: '#4B70DD',
    rotationSpeed: 0.032,
    orbitSpeed: 0.005,
    description: 'The windiest planet in our solar system',
    moons: 16
  }
];

const OrbitRing: React.FC<{ radius: number }> = ({ radius }) => {
  const ringRef = useRef<THREE.BufferGeometry>(null);
  
  const points = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return points;
  }, [radius]);

  return (
    <line>
      <bufferGeometry ref={ringRef}>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="white" opacity={0.3} transparent />
    </line>
  );
};

const Planet: React.FC<{ 
  data: PlanetData; 
  onHover: (planet: PlanetData | null) => void;
  onClick: (planet: PlanetData) => void;
}> = ({ data, onHover, onClick }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += data.orbitSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[data.distance, 0, 0]}
        onPointerOver={() => onHover(data)}
        onPointerOut={() => onHover(null)}
        onClick={() => onClick(data)}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial 
          color={data.color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Add Earth's moon */}
      {data.name === 'Earth' && (
        <group>
          <mesh position={[data.distance + 0.8, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
          </mesh>
        </group>
      )}
      
      {/* Add Saturn's rings */}
      {data.name === 'Saturn' && (
        <group position={[data.distance, 0, 0]} rotation={[Math.PI / 6, 0, 0]}>
          <mesh>
            <ringGeometry args={[data.size * 1.2, data.size * 2, 64]} />
            <meshBasicMaterial 
              color="#D2B48C" 
              side={THREE.DoubleSide} 
              opacity={0.6} 
              transparent 
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Sun: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#FDB813"
        emissive="#FDB813"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const Scene: React.FC<{
  hoveredPlanet: PlanetData | null;
  setHoveredPlanet: (planet: PlanetData | null) => void;
  setSelectedPlanet: (planet: PlanetData) => void;
}> = ({ hoveredPlanet, setHoveredPlanet, setSelectedPlanet }) => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} decay={2} />
      
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      
      <Sun />
      
      {/* Orbit rings */}
      {planetData.map((planet) => (
        <OrbitRing key={`${planet.name}-orbit`} radius={planet.distance} />
      ))}
      
      {/* Planets */}
      {planetData.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          onHover={setHoveredPlanet}
          onClick={setSelectedPlanet}
        />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const InfoPanel: React.FC<{ planet: PlanetData | null; onClose: () => void }> = ({ 
  planet, 
  onClose 
}) => {
  if (!planet) return null;

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white p-6 rounded-lg max-w-sm border border-white/20">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-yellow-400">{planet.name}</h3>
        <button 
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        <p className="text-white/90 leading-relaxed">{planet.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-400 font-semibold">Distance:</span>
            <p className="text-white/80">{planet.distance} AU</p>
          </div>
          
          <div>
            <span className="text-blue-400 font-semibold">Moons:</span>
            <p className="text-white/80">{planet.moons}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <div 
            className="w-4 h-4 rounded-full border-2 border-white/30" 
            style={{ backgroundColor: planet.color }}
          />
          <span className="text-white/80 text-sm">Planet Color</span>
        </div>
      </div>
    </div>
  );
};

const Controls: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20">
      <h4 className="font-semibold mb-2 text-yellow-400">Controls</h4>
      <div className="space-y-1 text-sm text-white/80">
        <p>• Mouse: Rotate view</p>
        <p>• Scroll: Zoom in/out</p>
        <p>• Right-click + drag: Pan</p>
        <p>• Click planet: View details</p>
      </div>
    </div>
  );
};

const SolarSystem: React.FC = () => {
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 10, 20], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene
          hoveredPlanet={hoveredPlanet}
          setHoveredPlanet={setHoveredPlanet}
          setSelectedPlanet={setSelectedPlanet}
        />
      </Canvas>
      
      {/* Title */}
      <div className="absolute top-4 left-4">
        <h1 className="text-4xl font-bold text-white mb-2">
          Solar System
        </h1>
        <p className="text-white/70">
          Interactive 3D exploration of our solar system
        </p>
      </div>
      
      {/* Hover tooltip */}
      {hoveredPlanet && !selectedPlanet && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg border border-white/30">
            <p className="font-semibold">{hoveredPlanet.name}</p>
            <p className="text-sm text-white/80">Click for details</p>
          </div>
        </div>
      )}
      
      <InfoPanel 
        planet={selectedPlanet} 
        onClose={() => setSelectedPlanet(null)} 
      />
      
      <Controls />
    </div>
  );
};

export default SolarSystem;