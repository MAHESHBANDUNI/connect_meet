import { FC } from 'react';
import { Video, Lock, Share2, Clock, MessageSquare, Globe } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Features: FC = () => {
  const features: Feature[] = [
    {
      icon: <Video className="w-8 h-8" />,
      title: 'HD Video & Audio',
      description: 'Crystal clear 1080p video and studio-quality audio for professional meetings'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'End-to-end encryption and enterprise-grade security protocols'
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Screen Sharing',
      description: 'Share your entire screen or specific application windows'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Smart Scheduling',
      description: 'Integrates with your calendar and sends automatic reminders'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Live Chat & Reactions',
      description: 'Real-time messaging and expressive reactions during meetings'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Access',
      description: 'Connect with anyone, anywhere with low-latency global servers'
    }
  ];

  return (
    <div id="features" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Perfect Meetings
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Packed with features designed to make your virtual meetings productive and engaging
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;