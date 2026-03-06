"use client";

import { FC, useState, useCallback, useEffect, useRef } from "react";
import { Play, Users, Shield, Video, Keyboard, Link, Plus, Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
      if(!isStartingInstantMeeting.current){
        successToast("Meeting scheduled successfully");
      }
      if(isStartingInstantMeeting.current){
        const data = await response.json()
        return data;
      }
    } catch(err) {
      if(!isStartingInstantMeeting.current){
        console.error('Failed to schedule meeting: ',error);
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

  useEffect(()=>{
    if(meetingCode.length===0){
      setError('');
    }
  },[meetingCode]);

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

  const handleClickInstantMeeting = async() =>{
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
      console.error('Failed to start meeting: ',error);
      errorToast('Failed to start meeting');
    }
  };

  return (
    <div className={`py-20 px-6 ${className}`}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect with{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-400">
                Clarity
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Professional video meetings for teams of all sizes. Crystal clear
              audio, HD video, and enterprise-grade security in one simple
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-2">

              {/* START MEETING BUTTON */}
              <div className="relative flex items-center">
                <button
                  onClick={() => {
                    if (session?.user) {
                      setShowMeetingOptions((prev) => !prev);
                    } else {
                      infoToast("User signin is required to start meetings.");
                      router.push("/auth/signin");
                    }
                  }}
                  className="cursor-pointer w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow-lg flex items-center justify-center"
                >
                  Start Free Meeting
                  <Play className="w-5 h-5 ml-2" />
                </button>

                {showMeetingOptions && (
                  <div className="absolute right-0 top-full mt-2 w-full bg-white border rounded-lg z-50 shadow-md border-gray-200">

                    <button
                      onClick={openCreateMeetingModal}
                      className="w-full text-left px-4 py-3 flex items-center hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <Link className="w-5 h-5 mr-2" />
                      Schedule Meeting
                    </button>

                    <button
                      onClick={handleClickInstantMeeting}
                      className="w-full text-left px-4 py-3 flex items-center hover:bg-blue-50 hover:text-blue-600 transition">
                      {isStartingInstantMeeting.current ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                      {isStartingInstantMeeting.current ? 'Starting meeting' : 'Start Instant Meeting'}
                    </button>

                  </div>
                )}
              </div>

              {/* JOIN MEETING INPUT */}
              <div className="flex items-center px-4 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 transition text-lg bg-white shadow-lg">

                <Keyboard className="w-5 h-5 mr-3 shrink-0" />

                <input
                  type="text"
                  value={meetingCode}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  onKeyDown={handleEnter}
                  placeholder="Enter a code or link"
                  className="flex-1 bg-transparent outline-none"
                />

                {meetingCode && (
                  <button
                    onClick={() => {
                      if (session?.user) {
                        joinMeeting(meetingCode);
                      } else {
                        infoToast("User signin is required to join meetings.");
                        router.push("/auth/signin");
                      }
                    }}
                    className="cursor-pointer ml-3 px-2 py-0 text-blue-600 font-semibold bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Join
                  </button>
                )}

              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}

            {/* FEATURES */}
            <div className="flex items-center space-x-8 mt-6">

              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700">100+ participants</span>
              </div>

              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700">End-to-end encryption</span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE VIDEO */}
          <div className="relative">
            <div className="relative bg-linear-to-br from-blue-500 to-indigo-400 rounded-2xl p-1 shadow-2xl">
              <div className="bg-white rounded-2xl p-6">

                <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden">
                  <video
                    src="/videos/video1.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between">

                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>

                    <div>
                      <h4 className="font-semibold">Team Meeting</h4>
                      <p className="text-sm text-gray-500">
                        Connected: 12 participants
                      </p>
                    </div>
                  </div>

                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Join Now
                  </button>

                </div>
              </div>
            </div>
          </div>

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