"use client";

import { FC } from 'react';
import { UserPlus, Settings, MessageSquare, ArrowRight, Video, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorks: FC = () => {
  const steps = [
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Start or Join',
      description: 'Host an instant meeting or enter a code to join an existing session seamlessly.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Configure Media',
      description: 'Review your camera and microphone settings in our secure pre-join waiting room.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Collaborate',
      description: 'Enjoy high-quality video, real-time chat, screen sharing, and interactive whiteboard tools.',
      color: 'from-purple-500 to-blue-500'
    }
  ];

  return (
    <div id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6"
          >
            Simple Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 tracking-tight"
          >
            How ConnectMeet Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto font-medium"
          >
            Get started in seconds with our streamlined 3-step process. No complex installations or steep learning curves.
          </motion.p>
        </div>

        <div className="relative">
          {/* Timeline Line (Desktop) */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[15%] right-[15%] h-1 bg-linear-to-r from-blue-100 via-indigo-100 to-purple-100 -z-0" />

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative group flex flex-col items-center text-center"
              >
                {/* Icon Container */}
                <div className={`relative z-10 w-24 h-24 bg-linear-to-br ${step.color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-10 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {step.icon}

                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white text-gray-900 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl border border-gray-100">
                    {index + 1}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed font-medium px-4">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Decor (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-8 text-gray-200">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;