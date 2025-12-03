'use client'
import { motion } from 'framer-motion'

const DashboardPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      <div className="relative">
        <div className="relative w-full max-w-[500px] h-[400px] rounded-2xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Revenue', value: '$48.2K', change: '+12.5%' },
                { label: 'Users', value: '2,847', change: '+8.2%' },
                { label: 'Active', value: '1,429', change: '+23.1%' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-green-500 mt-0.5">{stat.change}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="h-32 rounded-xl bg-white/5 border border-white/10 flex items-end justify-around px-4 pb-4 pt-8"
              style={{ transformOrigin: 'bottom' }}
            >
              {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 1 + i * 0.05, duration: 0.4 }}
                  className="w-6 rounded-t-md bg-gradient-to-t from-blue-500/50 to-blue-500"
                />
              ))}
            </motion.div>

            <div className="space-y-2">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30" />
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-white/20 rounded" />
                    <div className="h-1.5 w-16 bg-white/10 rounded mt-1.5" />
                  </div>
                  <div className="h-6 w-16 bg-blue-500/20 rounded-md" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-4 -left-4 w-20 h-20 rounded-xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center"
        >
          <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
      </div>

      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
      </div>
    </motion.div>
  )
}

export default DashboardPreview