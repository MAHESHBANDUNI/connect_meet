"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
export function MeetingEnd({ 
    redirectUrl = "/meetings",
    onRedirect 
}: { 
    redirectUrl?: string;
    onRedirect?: () => void;
}) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleRedirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleRedirect = () => {
        onRedirect?.();
        window.location.href = redirectUrl;
    };

    return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-slideUp">
        
            <div className="absolute inset-0 opacity-5">
                <div className="absolute -inset-[10px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-spin-slow blur-3xl" />
            </div>
            
            
            <div className="relative h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-gradient-x" />
            
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full animate-float" />
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-indigo-400/20 rounded-full animate-float-delayed" />
                <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-blue-500/20 rounded-full animate-float-slow" />
            </div>
            
            <div className="relative p-8 sm:p-10">
                <div className="relative flex justify-center mb-6 mt-6">
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-4 border-blue-200 dark:border-blue-900/30 rounded-full animate-ping-slow" />
                        <div className="absolute w-20 h-20 border-4 border-blue-300 dark:border-blue-800/40 rounded-full animate-ping-slower" />
                    </div>
                    
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-4 shadow-xl transform hover:scale-110 transition-transform duration-300 animate-float">
                        <Video className="w-8 h-8 text-white" />
                        
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-4 border-white dark:border-gray-800 animate-bounce-subtle">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>
        
                <div className="text-center space-y-2 animate-stagger">
                    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Meeting Ended
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                        Thanks for joining! Hope it was productive.
                    </p>
                </div>
        
                <div className="mt-8 flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-4">
                       
                        <svg className="w-24 h-24 transform -rotate-90">
                            <defs>
                                <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                            
                            <circle
                                className="text-gray-200 dark:text-gray-700"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="transparent"
                                r="44"
                                cx="48"
                                cy="48"
                            />
                            
                            <circle
                                stroke="url(#countdown-gradient)"
                                strokeWidth="4"
                                strokeDasharray={2 * Math.PI * 44}
                                strokeDashoffset={2 * Math.PI * 44 * (1 - countdown / 5)}
                                strokeLinecap="round"
                                fill="transparent"
                                r="44"
                                cx="48"
                                cy="48"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse-scale">
                                {countdown}
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Auto-redirecting...
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
}