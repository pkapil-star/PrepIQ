import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, Sparkles, useCursor } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const TOPICS = ['Graphs', 'Dynamic Programming', 'Trees', 'OS Scheduling', 'DBMS Indexing', 'Networking', 'OOP',
  'Sliding Window', 'Recursion', 'Heaps', 'Deadlocks', 'SQL Joins', 'TCP/IP', 'Hashing', 'Binary Search', 'Tries']
const LOW = new THREE.Color('#6366f1')
const HIGH = new THREE.Color('#f59e0b')

// Evenly spread points on a sphere (Fibonacci lattice), so the graph looks the same from every angle.
function spherePoints(count, radius) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    return new THREE.Vector3(Math.cos(golden * i) * r * radius, y * radius, Math.sin(golden * i) * r * radius)
  })
}

function TopicNode({ position, label, priority }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const color = useMemo(() => LOW.clone().lerp(HIGH, priority), [priority])
  return (
    <mesh
      position={position} scale={hovered ? 2 : 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2.5 : 0.7} />
      {hovered && (
        <Html center position={[0, 0.12, 0]} className="pointer-events-none">
          <span className="whitespace-nowrap rounded-full bg-slate-900/90 px-3 py-1 text-xs text-white ring-1 ring-white/20">
            {label} · priority {priority.toFixed(2)}
          </span>
        </Html>
      )}
    </mesh>
  )
}

function TopicGraph({ progress }) {
  const group = useRef()
  const viewport = useThree((s) => s.viewport)
  const { nodes, edges } = useMemo(() => {
    const points = spherePoints(42, 1.6)
    const pos = []
    points.forEach((a, i) => points.slice(i + 1).forEach((b) => {
      if (a.distanceTo(b) < 1.05) pos.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }))
    // Fixed pseudo-random priorities so the colours don't reshuffle on every mount.
    const nodes = points.map((p, i) => ({ p, label: TOPICS[i % TOPICS.length], priority: Math.sin(i * 12.9898) * 0.5 + 0.5 }))
    return { nodes, edges: new Float32Array(pos) }
  }, [])

  const wide = viewport.width > 6
  const scale = Math.min(1, viewport.width / 4.5)

  useFrame((state, delta) => {
    const g = group.current
    const p = progress.current
    g.rotation.y += delta * 0.12
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.pointer.y * 0.35 + p * 0.8, 4, delta)
    // Scrolling past the hero pulls the camera back so the graph shrinks away with the section.
    const cam = state.camera
    cam.position.z = THREE.MathUtils.damp(cam.position.z, 5 + p * 4, 4, delta)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.5, 3, delta)
    cam.lookAt(0, 0, 0)
  })

  return (
    <group ref={group} position={[wide ? 1.5 : 0, 0, 0]} scale={scale}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#818cf8" transparent opacity={0.22} />
      </lineSegments>
      {nodes.map((n, i) => <TopicNode key={i} position={n.p} label={n.label} priority={n.priority} />)}
      <Float speed={2} rotationIntensity={1} floatIntensity={0.6}>
        <mesh>
          <icosahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial color="#4f46e5" emissive="#4338ca" emissiveIntensity={0.6} wireframe />
        </mesh>
      </Float>
    </group>
  )
}

export default function HeroScene({ progress, reducedMotion }) {
  const wrapper = useRef()
  const [visible, setVisible] = useState(true)

  // Stop rendering frames when the hero is scrolled out of view to save GPU/battery.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(wrapper.current)
    return () => observer.disconnect()
  }, [])

  const mobile = window.innerWidth < 768

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={visible && !reducedMotion ? 'always' : 'demand'}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 4]} intensity={40} color="#a5b4fc" />
        <TopicGraph progress={progress} />
        <Sparkles count={mobile ? 60 : 160} scale={[10, 6, 4]} size={2} speed={0.3} color="#c7d2fe" />
      </Canvas>
    </div>
  )
}
