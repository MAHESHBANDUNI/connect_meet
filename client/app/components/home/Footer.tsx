import { FC } from 'react';
import { Video, Facebook, Twitter, Linkedin, Instagram, Github, Mail } from 'lucide-react';

const Footer: FC = () => {
  const footerLinks = {
    Product: ['Features', 'How it Works', 'Meetings', 'Security'],
    Company: ['About Us', 'Careers', 'Blog'],
    Support: ['Help Center', 'Community', 'Contact Us'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
  };

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' }
  ];

  return (
    <footer className="bg-[#0A0C10] text-gray-400 py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">

          {/* Brand & Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Connect<span className="text-blue-500">Meet</span>
              </span>
            </div>

            <p className="text-base leading-relaxed max-w-sm">
              Building the future of remote collaboration. Experience professional video conferencing with crystal clear quality and ironclad security.
            </p>

            <div className="flex items-center space-x-5">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">{category}</h4>
                <ul className="space-y-4">
                  {links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-[15px] font-medium hover:text-blue-500 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 text-sm font-medium">
            <span className="text-gray-500">© {new Date().getFullYear()} ConnectMeet Inc.</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-800" />
            <span className="text-blue-500">Built for modern teams.</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;