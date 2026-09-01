import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Calendar, Ticket, Music, Users, MapPin } from 'lucide-react';
import { Logo } from '../components/Logo';

const FLOATING_ICONS = [
  { Icon: Calendar, top: '12%', left: '8%', delay: 0 },
  { Icon: Ticket, top: '18%', right: '10%', delay: 0.4 },
  { Icon: Music, bottom: '28%', left: '12%', delay: 0.8 },
  { Icon: Users, bottom: '22%', right: '14%', delay: 1.2 },
  { Icon: MapPin, top: '42%', left: '5%', delay: 0.6 },
  { Icon: Sparkles, top: '35%', right: '6%', delay: 1 },
] as const;

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <section className="relative w-full overflow-hidden rounded-[32px] shadow-xl shadow-violet-900/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-900" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/90 via-purple-900/75 to-violet-800/60" />

        <motion.div
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-fuchsia-400/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-indigo-400/25 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-300/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {FLOATING_ICONS.map(({ Icon, delay, ...pos }, i) => (
          <motion.div
            key={i}
            className="absolute hidden md:flex w-12 h-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/80"
            style={pos}
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        ))}

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 sm:px-8 lg:px-12 pt-16 pb-20 md:pt-20 md:pb-28">
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center items-center w-full mb-8"
            >
              <div className="inline-flex justify-center items-center bg-white rounded-3xl px-10 py-6 shadow-2xl shadow-black/20">
                <Logo size="xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center items-center w-full mb-8"
            >
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-semibold text-sm text-center">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-violet-200" />
                </motion.span>
                <span>The new standard for event management</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight"
            >
              Create, manage, and discover{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white">
                extraordinary events.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full text-lg md:text-xl text-violet-100/90 mb-12 max-w-2xl leading-relaxed"
            >
              EventHive brings organizers and attendees together in one beautifully crafted platform. Effortless scheduling, seamless registration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
            >
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-violet-50 text-violet-700 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-black/20 hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                Explore Events <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-bold text-lg transition-all inline-flex items-center justify-center"
              >
                Host an Event
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
