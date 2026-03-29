import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListOrdered, Trophy, BarChart3, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../shared/constants/routes';

const quickCards = [
  {
    title: 'Tabla de Posiciones',
    description: 'Consulta la clasificación actualizada de todos los equipos',
    icon: ListOrdered,
    to: ROUTES.STANDINGS,
    gradient: { from: '#1B3C73', to: '#0F2647' },
  },
  {
    title: 'Resultados',
    description: 'Revisa los marcadores de cada jornada',
    icon: Trophy,
    to: ROUTES.RESULTS,
    gradient: { from: '#0F2647', to: '#1B3C73' },
  },
  {
    title: 'Estadísticas',
    description: 'Las mejores actuaciones individuales de la temporada',
    icon: BarChart3,
    to: ROUTES.STATS,
    gradient: { from: '#1B3C73', to: '#0F2647' },
  },
];

export const HomePage = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0F2647 0%, #1B3C73 50%, #0F2647 100%)',
          overflow: 'hidden',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginTop: -16,
        }}
      >
        {/* Animated background elements */}
        <div style={{ position: 'absolute', inset: 0, opacity: 1 }}>
          {/* Gradient orbs */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: -100,
              left: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              bottom: -150,
              right: -100,
              width: 450,
              height: 450,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(27, 60, 115, 0.3) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          {/* Accent lines */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5), transparent)',
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '100px 16px 120px',
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: 24,
              background: '#FFFFFF',
              marginBottom: 32,
              boxShadow: '0 20px 40px -10px rgba(212, 175, 55, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              padding: 12,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: 24,
                background: 'conic-gradient(from 0deg, rgba(212, 175, 55, 0.5), transparent 25%)',
                opacity: 0.5,
              }}
            />
            <img
              src="/lmff_logo.png"
              alt="Liga Metropolitana FF"
              style={{
                height: '100%',
                width: '100%',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 10,
              }}
            />
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: '0 0 12px 0',
                lineHeight: 1.1,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              Liga Metropolitana
            </h1>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'linear-gradient(to right, #D4AF37 0%, #F5D547 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              de Flag Football
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginTop: 28,
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: 700,
              margin: '28px auto 0',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            }}
          >
            Caracas, Venezuela — Resultados, posiciones y más
          </motion.p>

          {/* Accent decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              marginTop: 40,
              height: '3px',
              width: '60px',
              background: 'linear-gradient(to right, transparent, #D4AF37, transparent)',
              margin: '40px auto 0',
            }}
          />
        </div>
      </section>

      {/* Quick Access Cards */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 16px',
          marginTop: -32,
          paddingBottom: 64,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            maxWidth: 1024,
            margin: '0 auto',
          }}
        >
          {quickCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <Link
                  to={card.to}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 12,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      padding: 24,
                      height: '100%',
                      transition: 'all 300ms ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: `linear-gradient(to bottom right, ${card.gradient.from}, ${card.gradient.to})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        transition: 'transform 300ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Icon size={24} color="#FFFFFF" />
                    </div>
                    <h3
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        marginTop: 4,
                        fontSize: '0.875rem',
                        color: '#6B7280',
                      }}
                    >
                      {card.description}
                    </p>
                    <div
                      style={{
                        marginTop: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#1B3C73',
                        transition: 'gap 300ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.gap = '8px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.gap = '4px';
                      }}
                    >
                      Ver más <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
