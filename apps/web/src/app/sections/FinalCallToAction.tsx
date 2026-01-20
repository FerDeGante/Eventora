"use client";

import { motion } from "framer-motion";
import { EventoraButton } from "../components/ui/EventoraButton";

export function FinalCallToAction() {
  return (
    <section className="relative py-32 px-4 bg-gradient-to-br from-[#1A73E8] to-[#A142F4] overflow-hidden">
      {/* Animated background shapes */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{
          y: [0, 50, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            Eventora Aura Neo
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight"
        >
          Listo para tu cadena de
          <br />
          <span className="font-normal">clínicas, spa o wellness center</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Despliega wizard, POS, marketplace, stripe webhooks y Resend templates en cuestión de días 
          con una UX digna de Chrome/Gemini.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            className="inline-flex items-center justify-center
                       px-8 py-4 rounded-full
                       bg-white text-[#1A73E8]
                       font-medium text-base
                       shadow-lg hover:shadow-xl
                       transition-all duration-300 ease-out
                       hover:scale-105 active:scale-95"
          >
            Agendar demo
          </button>
          <button
            className="inline-flex items-center justify-center
                       px-8 py-4 rounded-full
                       bg-transparent text-white
                       border-2 border-white/30 hover:border-white/50
                       font-medium text-base
                       backdrop-blur-sm
                       transition-all duration-300 ease-out
                       hover:bg-white/10"
          >
            Descargar roadmap
          </button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 pt-12 border-t border-white/20"
        >
          <p className="text-white/70 text-sm mb-6">Confiado por clínicas líderes</p>
          <div className="flex flex-wrap gap-8 justify-center items-center opacity-60">
            {["Stripe", "Mercado Pago", "Resend", "WhatsApp"].map((brand) => (
              <div key={brand} className="text-white font-medium text-lg">
                {brand}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
