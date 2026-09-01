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
    </div>
  );
};
