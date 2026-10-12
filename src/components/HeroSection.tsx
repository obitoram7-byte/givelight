"use client";

import { motion } from 'framer-motion'
import { Sparkles, Heart, Globe2, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-white to-emerald-50/30">
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-8 border border-emerald-100">
            <Sparkles size={16} className="text-warm-gold" />
            {t.hero.eyebrow}
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-forest-green mb-6 leading-tight">
            <span className="block">{t.hero.h1a}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-emerald-600">
              {t.hero.h1b}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-forest-green text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Heart size={20} />
              {t.hero.cta}
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-forest-green border-2 border-forest-green rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Globe2 size={20} />
              {t.hero.how}
            </motion.button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            {t.hero.safe}
          </p>
        </motion.div>
      </div>
    </section>
  )
}