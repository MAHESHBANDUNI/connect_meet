"use client";

import { FC } from 'react';
import { Video, Lock, Share2, MessageSquare, Hand, Layout, Calendar, ShieldCheck, Users, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Features: FC = () => {
  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'HD Video & Audio',
      description: 'Crystal clear communication with low-latency streaming and adaptive quality.',
      color: 'bg-blue-500'
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: 'Seamless Screen Sharing',
      description: 'Present your ideas by sharing your entire screen or specific application windows.',
      color: 'bg-indigo-500'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Real-time Interactive Chat',
      description: 'Exchange messages and keep the conversation flowing without interruptions.',
      color: 'bg-purple-500'
    },
    {
      icon: <PenTool className="w-6 h-6" />,
      title: 'Collaborative Whiteboard',
      description: 'Brainstorm and visualize ideas together in real-time on a shared canvas.',
      color: 'bg-orange-500'
    },
    {
      icon: <Hand className="w-6 h-6" />,
      title: 'Hand Raise System',
      description: 'Maintain order and participation with an intuitive hand-raising feature.',
      color: 'bg-amber-500'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Secure Waiting Room',
      description: 'Admit participants manually to ensure only authorized people join your meeting.',
      color: 'bg-green-500'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Smart Scheduling',
      description: 'Create instant meetings or plan ahead with detailed scheduling options.',
      color: 'bg-rose-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Host Controls',
      description: 'Take full command with advanced permissions for audio, screen share, and more.',
      color: 'bg-cyan-500'
    }
  ];

  return (
    <div id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 tracking-tight"
          >
            Powerfully Simple Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto font-medium"
          >
            Everything you need for seamless collaboration and productive remote meetings, all in one place.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className={`w-24 h-24 rounded-full ${feature.color}`} />
              </div>

              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-100 transform group-hover:rotate-6 transition-transform`}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;