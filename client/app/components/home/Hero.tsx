"use client";
import { FC, useState } from 'react';
import { Play, Users, Shield, Zap, Video, Keyboard, Link, Plus } from 'lucide-react';

interface HeroProps {
  className?: string;
}

const Hero: FC<HeroProps> = ({ className = '' }) => {
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  return (
    <div className={`py-20 px-6 ${className}`}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-purple-400">
                Clarity
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Professional video meetings for teams of all sizes. Crystal clear audio, 
              HD video, and enterprise-grade security in one simple platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="relative flex items-center">                
                  <button onClick={() => setShowMeetingOptions(prev => !prev)} className="w-full px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-lg font-semibold shadow-lg flex items-center justify-center">
                    Start Free Meeting
                    <Play className="w-5 h-5 ml-2" />
                  </button>
                  {showMeetingOptions && (
                  <div className="absolute right-0 top-full mt-2 w-full bg-white border rounded-lg z-50 shadow-md border-gray-200">
                    <button
                      type="button"
                      className="w-full text-left font-medium px-4 py-2 text-sm sm:text-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition align-items-center flex"
                    >
                      <Link className="w-4 h-4 sm:w-5.5 sm:h-5.5 inline-block mr-2 mt-0.5" />
                      Schedule Meeting
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm sm:text-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition align-items-center flex"
                    >
                      <Plus className="w-4 h-4 sm:w-5.5 sm:h-5.5 inline-block mr-2 mt-0.5" />
                      Start an Instant Meeting
                    </button>
                  </div>
                  )}
                </div>
                <div className="flex items-center px-4 py-4 border-2 border-gray-300 text-gray-900 rounded-lg hover:border-emerald-600 hover:bg-gray-50 transition-all text-lg bg-white shadow-lg">
                  <Keyboard className="w-5 h-5 mr-4 flex-shrink-0" />
                  <input 
                    className="flex-1 bg-transparent outline-none border-0 text-lg font-medium placeholder-gray-500" 
                    placeholder="Enter a code or link" 
                  />
            </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">100+ participants</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">End-to-end encryption</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-gradient-to-br from-emerald-500 to-purple-400 rounded-2xl p-1 shadow-2xl">
              <div className="bg-white rounded-2xl p-6">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden">
                  <video
                    src="/videos/video1.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    controls={false}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Team Meeting</h4>
                      <p className="text-sm text-gray-500">Connected: 12 participants</p>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                    Join Now
                  </button>
                  
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-float"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;