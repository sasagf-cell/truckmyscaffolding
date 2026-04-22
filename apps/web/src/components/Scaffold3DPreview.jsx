import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';

const ScaffoldBox = ({ width = 2, length = 3, height = 4 }) => {
  // Normalize dimensions (scaled for visibility)
  const w = Math.max(0.5, width / 2);
  const l = Math.max(0.5, length / 2);
  const h = Math.max(0.5, height / 2);

  return (
    <group position={[0, h, 0]}>
      {/* Main Wireframe Box */}
      <mesh>
        <boxGeometry args={[w, h * 2, l]} />
        <meshBasicMaterial color="#f97316" wireframe />
      </mesh>

      {/* Structural Poles (Corners) */}
      <mesh position={[-w/2, 0, -l/2]}>
        <cylinderGeometry args={[0.05, 0.05, h * 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[w/2, 0, -l/2]}>
        <cylinderGeometry args={[0.05, 0.05, h * 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-w/2, 0, l/2]}>
        <cylinderGeometry args={[0.05, 0.05, h * 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[w/2, 0, l/2]}>
        <cylinderGeometry args={[0.05, 0.05, h * 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Base Foundation */}
      <mesh position={[0, -h, 0]}>
        <boxGeometry args={[w + 0.5, 0.1, l + 0.5]} />
        <meshBasicMaterial color="#64748B" opacity={0.5} transparent />
      </mesh>

      {/* Dimension Labels */}
      <Text
        position={[0, h + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`${width}m x ${length}m x ${height}m`}
      </Text>
    </group>
  );
};

const Scaffold3DPreview = ({ width, length, height }) => {
  return (
    <div className="w-full h-full min-h-[300px] bg-background/50 rounded-xl overflow-hidden border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10">
        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary text-white rounded">
          3D Digital Twin
        </span>
      </div>
      
      <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <ScaffoldBox width={width} length={length} height={height} />
        
        <Grid 
          infiniteGrid 
          fadeDistance={20} 
          sectionColor="#f97316" 
          sectionSize={1} 
          cellColor="#64748B" 
          cellSize={0.5} 
        />
        
        <OrbitControls makeDefault />
      </Canvas>
      
      <div className="absolute bottom-4 right-4 z-10 text-[10px] text-muted-foreground italic">
        Rotate & Zoom to Inspect
      </div>
    </div>
  );
};

export default Scaffold3DPreview;
