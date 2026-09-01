import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>The new standard for event management</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight max-w-4xl mx-auto"
        >
          Create, manage, and discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">extraordinary events.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          EventHive brings organizers and attendees together in one beautifully crafted platform. Effortless scheduling, seamless registration.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/events" 
            className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-black/10 hover:shadow-xl flex items-center justify-center gap-2"
          >
            Explore Events <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-bold text-lg transition-all hover:bg-gray-50 flex items-center justify-center"
          >
            Host an Event
          </Link>
        </motion.div>
      </section>

      {/* Feature highlight */}
      <section className="w-full bg-gray-900 rounded-[32px] py-32 mt-12 text-center px-4 overflow-hidden mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for clarity.</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-12">
            Whether you are organizing a small meetup or a massive conference, our minimal interface keeps the focus on what matters: your event.
          </p>
          <div className="aspect-video bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>
            {/* Abstract visual representation of dashboard */}
            <div className="p-8 flex flex-col gap-6 h-full opacity-50">
              <div className="h-12 w-full max-w-md bg-gray-700 rounded-xl"></div>
              <div className="flex gap-6 flex-1">
                <div className="w-1/3 bg-gray-700 rounded-2xl hidden md:block"></div>
                <div className="flex-1 bg-gray-700 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
