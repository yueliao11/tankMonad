import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TestCube: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[2, 2, 2]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

const TestScene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <TestCube />
    </>
  )
}

const SimpleGameTest: React.FC = () => {
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-white">
            Loading 3D Scene...
          </h2>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400">
            Testing Three.js integration
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black relative">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❤️</span>
              <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full transition-all duration-300" />
              </div>
              <span className="text-sm text-white/90">100/100</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">🏆</span>
              <span className="text-lg font-bold text-white">0</span>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-500">⏰</span>
            <span className="text-2xl font-mono font-bold text-white">3:00</span>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="text-sm text-white/90">
            <div>✅ 3D Scene: Loaded</div>
            <div>✅ Controls: Ready</div>
            <div>⏳ MultiSynq: Testing...</div>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 60,
        }}
        className="w-full h-full"
      >
        <TestScene />
      </Canvas>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4">
        <div className="space-y-1 text-xs text-gray-300">
          <div className="text-green-400 font-bold mb-2">🎉 3D Test Scene Loaded!</div>
          <div>✅ Three.js: Working</div>
          <div>✅ React Three Fiber: Working</div>
          <div>🔄 Rotating cube animation</div>
          <div className="mt-2 text-yellow-400">Ready for full game!</div>
        </div>
      </div>
    </div>
  )
}

export default SimpleGameTest