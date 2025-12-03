'use client'
import { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    console.log('🎨 Creating particles...') 

    const particleCount = 90
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      const size = Math.random() * 3 + 2 
      const left = Math.random() * 100
      const delay = Math.random() * 20
      const duration = Math.random() * 15 + 15
      const opacity = Math.random() * 0.5 + 0.3 
      
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        top: ${Math.random() * 100}%;
        animation: flaot ${duration}s ease-in-out ${delay}s infinite;
        background: rgba(96, 165, 250, ${opacity});
        box-shadow: 0 0 ${size * 4}px rgba(96, 165, 250, ${opacity * 0.8});
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
      `
      
      container.appendChild(particle)
      particles.push(particle)
    }

    console.log(`✅ Created ${particles.length} particles`) 

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        className="absolute w-[600px] h-[600px] -top-48 -left-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-float 20s ease-in-out infinite',
          animationDelay: '0s',
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] top-1/2 -right-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-float 20s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] -bottom-32 left-1/3 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-float 20s ease-in-out infinite',
          animationDelay: '4s',
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(10, 15, 30, 0.8) 70%)',
        }}
      />
      
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  )
}

export default ParticleBackground