import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, ListOrdered, BarChart3, Home, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../shared/constants/routes';
import { usePublicLeague } from '../../features/leagues/context/PublicLeagueContext';

const navLinks = [
  { to: ROUTES.HOME, label: 'Inicio', icon: Home },
  { to: ROUTES.STANDINGS, label: 'Posiciones', icon: ListOrdered },
  { to: ROUTES.RESULTS, label: 'Resultados', icon: Trophy },
  { to: ROUTES.STATS, label: 'Estadísticas', icon: BarChart3 },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false);
  const location = useLocation();
  const { leagues, selectedLeagueId, setSelectedLeagueId } = usePublicLeague();
  const showLeagueSelector = leagues.length > 1;
  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#1B3C73',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {/* Logo */}
        <Link
          to={ROUTES.HOME}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={20} color="#1B3C73" />
          </div>
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              letterSpacing: '0.05em',
              color: '#FFFFFF',
              display: isMobile ? 'none' : 'inline-block',
            }}
          >
            LMFF
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: isMobile ? 'none' : 'flex',
            gap: 4,
            alignItems: 'center',
            flex: 1,
          }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 6,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 200ms',
                  textDecoration: 'none',
                  background: isActive ? '#D4AF37' : 'transparent',
                  color: isActive ? '#1B3C73' : 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(27, 60, 115, 0.1)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }
                }}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* League Selector (Desktop) */}
        {!isMobile && showLeagueSelector && (
          <div
            style={{
              position: 'relative',
            }}
          >
            <button
              onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 6,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid rgba(212, 175, 55, 0.5)',
                background: 'transparent',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                e.currentTarget.style.borderColor = '#D4AF37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
              }}
            >
              {selectedLeague?.name || 'Liga'}
              <ChevronDown size={16} />
            </button>

            {leagueDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: '#FFFFFF',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 100,
                  minWidth: 200,
                  overflow: 'hidden',
                }}
              >
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => {
                      setSelectedLeagueId(league.id);
                      setLeagueDropdownOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      border: 'none',
                      background: selectedLeagueId === league.id ? '#D4AF37' : 'transparent',
                      color: selectedLeagueId === league.id ? '#1B3C73' : '#111827',
                      cursor: 'pointer',
                      transition: 'all 200ms',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLeagueId !== league.id) {
                        e.currentTarget.style.backgroundColor = '#F5F5F5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLeagueId !== league.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {league.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: isMobile ? 'block' : 'none',
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            padding: 8,
            borderRadius: 6,
            cursor: 'pointer',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                top: 64,
                background: 'rgba(0, 0, 0, 0.4)',
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: 64,
                right: 0,
                bottom: 0,
                width: 288,
                background: '#1B3C73',
                zIndex: 50,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 16,
                  gap: 4,
                }}
              >
                {showLeagueSelector && (
                  <div
                    style={{
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Seleccionar Liga
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {leagues.map((league) => (
                        <button
                          key={league.id}
                          onClick={() => {
                            setSelectedLeagueId(league.id);
                            setMobileOpen(false);
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '10px 12px',
                            border: 'none',
                            background: selectedLeagueId === league.id ? '#D4AF37' : 'transparent',
                            color: selectedLeagueId === league.id ? '#1B3C73' : 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer',
                            transition: 'all 200ms',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            borderRadius: 6,
                          }}
                          onMouseEnter={(e) => {
                            if (selectedLeagueId !== league.id) {
                              e.currentTarget.style.backgroundColor = 'rgba(27, 60, 115, 0.5)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedLeagueId !== league.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {league.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderRadius: 8,
                        fontSize: '1rem',
                        fontWeight: 500,
                        transition: 'all 200ms',
                        textDecoration: 'none',
                        background: isActive ? '#D4AF37' : 'transparent',
                        color: isActive ? '#1B3C73' : 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(27, 60, 115, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
