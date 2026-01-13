import { FC } from 'react';
import { Calendar, Video, Users, CheckCircle } from 'lucide-react';

const HowItWorks: FC = () => {
  const steps = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Schedule Meeting',
      description: 'Create a meeting and share the link with participants'
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Join Meeting',
      description: 'Click the link to join from any device, no downloads required'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Collaborate',
      description: 'Use screen sharing, chat, and whiteboard tools in real-time'
    }
  ];

  return (
    <div id="how-it-works" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How ConnectMeet Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and host professional meetings with ease
          </p>
        </div>
        
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-purple-400 rounded-full flex items-center justify-center text-white mx-auto mb-6">
                    {step.icon}
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-40 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-purple-400 to-pink-500 -z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;