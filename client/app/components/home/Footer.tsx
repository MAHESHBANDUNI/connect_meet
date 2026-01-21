import { FC } from 'react';
import { Video, Facebook, Twitter, Linkedin, Instagram, Github, Mail } from 'lucide-react';

const Footer: FC = () => {
  const footerLinks = {
    Product: ['Features', 'How it Works', 'Pricing', 'API'],
    Company: ['About Us', 'Careers', 'Press', 'Blog'],
    Support: ['Help Center', 'Community', 'Contact Us', 'Status'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR']
  };

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Newsletter Section */}
        <div className="max-w-4xl mx-auto mb-16 p-8 bg-linear-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl text-center">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-400 mr-3" />
            <h3 className="text-2xl font-bold">Stay Updated</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Subscribe to our newsletter for the latest updates and tips on virtual collaboration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
              Subscribe
            </button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-600 rounded-lg mr-3">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">
                Connect<span className="text-blue-400">Meet</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional video conferencing made simple. Connect with anyone, anywhere with our secure and reliable platform.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-6">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-blue-400 transition"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} ConnectMeet. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Cookie Policy</a>
              <a href="#" className="hover:text-emerald-400 transition">Security</a>
            </div>
          </div>

          {/* App Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center space-x-4 bg-gray-800/50 px-6 py-3 rounded-lg">
              <div className="text-2xl">📱</div>
              <div>
                <div className="text-sm text-gray-400">Available on</div>
                <div className="font-semibold">App Store</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-800/50 px-6 py-3 rounded-lg">
              <div className="text-2xl">🤖</div>
              <div>
                <div className="text-sm text-gray-400">Get it on</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-800/50 px-6 py-3 rounded-lg">
              <div className="text-2xl">💻</div>
              <div>
                <div className="text-sm text-gray-400">Desktop App</div>
                <div className="font-semibold">Windows & macOS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;