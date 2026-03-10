"use client";

import { FC, useState, useCallback, useEffect, useRef } from "react";
import { Play, Users, Shield, Video, Keyboard, Link, Plus, Loader, ArrowRight, CheckCircle2, Globe, Sparkles, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { infoToast, successToast, errorToast } from "../ui/toast";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal";

interface HeroProps {
  className?: string;
}

const Hero: FC<HeroProps> = ({ className = "" }) => {
  const [showMeetingOptions, setShowMeetingOptions] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const router = useRouter();

  const [scheduleMeetingFormOpen, setScheduleMeetingFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isStartingInstantMeeting = useRef(false);

  const openCreateMeetingModal = () => {
    setScheduleMeetingFormOpen(true);
  };

  const handleScheduleMeetingSubmit = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/meetings/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          topic: data.topic,
          description: data.description,
          startTime: data.date,
          directJoinPermission: data.directJoinPermission,
          mutePermission: data.mutePermission,
          screenSharePermission: data.screenSharePermission,
          dropPermission: data.dropPermission,
          cohosts: data.coHosts,
          invitees: data.invitees,
        }),
      });
      if (!response.ok) {
        throw new Error();
      }
      if (!isStartingInstantMeeting.current) {
        successToast("Meeting scheduled successfully");
      }
      if (isStartingInstantMeeting.current) {
        const data = await response.json()
        return data;
      }
    } catch (err) {
      if (!isStartingInstantMeeting.current) {
        console.error('Failed to schedule meeting: ', error);
        errorToast("Failed to schedule meeting");
      }
    } finally {
      setSaving(false);
      setScheduleMeetingFormOpen(false);
      isStartingInstantMeeting.current = false;
    }
  };

  const validateCode = (code: string): boolean => {
    const trimmed = code.trim();
    return trimmed.length === 19 && /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i.test(trimmed);
  };

  const joinMeeting = (code: string) => {
    const validCode = code.trim();

    if (validateCode(validCode)) {
      router.push(`/meeting/${validCode}`);
    } else {
      setError("Enter a valid meeting code (xxxx-xxxx-xxxx-xxxx)");
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      const pasted = e.clipboardData.getData("text");

      // Extract 4-4-4-4 code from URLs or direct paste
      const urlMatch = pasted.match(/\/([a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})/i);
      const directMatch = pasted.match(/([a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})/i);

      const extracted = urlMatch?.[1] || directMatch?.[1] || pasted.trim();

      setMeetingCode(extracted);
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setMeetingCode(value);
    setError(validateCode(value) ? "" : "Enter valid code: xxxx-xxxx-xxxx-xxxx");
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      joinMeeting(meetingCode);
    }
  };

  useEffect(() => {
    if (meetingCode.length === 0) {
      setError('');
    }
  }, [meetingCode]);

  useEffect(() => {
    if (scheduleMeetingFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [scheduleMeetingFormOpen]);

  const handleClickInstantMeeting = async () => {
    isStartingInstantMeeting.current = true;
    infoToast('Redirecting to the meeting...');
    await handleInstantMeeting();
  }

  const handleInstantMeeting = async () => {
    try {
      const data = {
        topic: "Quick meeting",
        description: 'None',
        date: new Date().toISOString(),
        directJoinPermission: true,
        mutePermission: false,
        screenSharePermission: true,
        dropPermission: false,
        coHosts: [],
        invitees: [],
      };

      const res = await handleScheduleMeetingSubmit(data);
      router.push(`meeting/${res.data.meetingCode}`)
    } catch (err) {
      console.error('Failed to start meeting: ', error);
      errorToast('Failed to start meeting');
    }
  };

  return (
    <div className={`relative min-h-[90vh] flex items-center overflow-hidden bg-white ${className}`}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* LEFT SIDE CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Next Generation Video Meetings
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
                Connected, <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                  Anywhere You Are
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Experience high-definition video meetings that feel as natural as being in the same room. Fast, secure, and built for modern teams.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              {/* START MEETING BUTTON GROUP */}
              <div className="relative flex-1 sm:flex-none">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (session?.user) {
                      setShowMeetingOptions((prev) => !prev);
                    } else {
                      infoToast("Sign in required to host meetings");
                      router.push("/auth/signin");
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-4.5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center group"
                >
                  <Video className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Start Meeting
                </motion.button>

                <AnimatePresence>
                  {showMeetingOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-full mt-4 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                    >
                      <button
                        onClick={openCreateMeetingModal}
                        className="w-full text-left px-5 py-3.5 flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                      >
                        <Calendar className="w-5 h-4 mr-3" />
                        Schedule for later
                      </button>
                      <button
                        onClick={handleClickInstantMeeting}
                        disabled={isStartingInstantMeeting.current}
                        className="w-full text-left px-5 py-3.5 flex items-center text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors border-t border-gray-50"
                      >
                        {isStartingInstantMeeting.current ? (
                          <Loader className="w-5 h-4 mr-3 animate-spin text-blue-600" />
                        ) : (
                          <Plus className="w-5 h-4 mr-3" />
                        )}
                        {isStartingInstantMeeting.current ? 'Creating...' : 'Start instant meeting'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* JOIN MEETING INPUT */}
              <div className="relative group flex-1 md:max-w-md">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Keyboard className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={meetingCode}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  onKeyDown={handleEnter}
                  placeholder="Enter meeting code"
                  className="w-full pl-12 pr-24 py-4.5 bg-white border-2 border-gray-100 rounded-2xl text-lg font-medium outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
                />

                <AnimatePresence>
                  {meetingCode && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        if (session?.user) {
                          joinMeeting(meetingCode);
                        } else {
                          infoToast("Sign in required to join");
                          router.push("/auth/signin");
                        }
                      }}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                    >
                      Join
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500 mt-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}

            {/* TRUST INDICATORS */}
            <div className="pt-8 flex flex-wrap items-center gap-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Encrypted</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">100+ Attendees</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-gray-700">Global Low-Latency</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE VISUALS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Main Visual Container */}
            <div className="relative p-2 bg-linear-to-br from-gray-100 to-gray-50 rounded-[2.5rem] shadow-3xl">
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm">

                {/* Visual Header */}
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">Live Session</div>
                </div>

                {/* Video Area */}
                <div className="aspect-video relative bg-gray-900 group">
                  <video
                    src="/videos/video1.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                  {/* Floating Participant Indicator */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">Rec 00:42:15</span>
                  </div>
                </div>

                {/* Visual Footer */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Product Review</h4>
                        <p className="text-xs text-gray-500 font-medium italic">Active: 24 members</p>
                      </div>
                    </div>
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-9 h-9 border-2 border-white rounded-full bg-gray-200 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-9 h-9 border-2 border-white rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+21</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 h-12 bg-gray-50 rounded-xl flex items-center justify-center group cursor-pointer hover:bg-gray-100 transition-colors">
                      <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <button className="flex-[3] h-12 bg-gray-900 text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all active:scale-95">
                      Join Discussion
                    </button>
                    <div className="flex-1 h-12 bg-gray-50 rounded-xl flex items-center justify-center group cursor-pointer hover:bg-gray-100 transition-colors">
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Assets */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 px-6 py-4 bg-white rounded-3xl shadow-2xl border border-gray-50 flex items-center space-x-4 z-20 hidden md:flex"
            >
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                <p className="text-sm font-semibold text-gray-900">100% Secure</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {scheduleMeetingFormOpen && <>
        <ScheduleMeetingModal
          isOpen={scheduleMeetingFormOpen}
          onClose={() => setScheduleMeetingFormOpen(false)}
          onSubmit={handleScheduleMeetingSubmit}
          saving={saving}
          setSaving={setSaving}
          initialData={undefined}
        /></>}
    </div>
  );
};

export default Hero;