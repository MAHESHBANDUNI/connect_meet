"use client";
import { VideoIcon, Clock, Users, MoreVertical, Trash2, Edit2 } from "lucide-react";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { errorToast, successToast } from "../ui/toast";
import { useRouter } from "next/navigation";

interface Meeting {
    meetingId: string;
    topic: string;
    startTime: string;
    endTime?: string;
    meetingCode: string;
    participantCount?: number;
    status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
    participants?: any[];
    userRole?: 'HOST' | 'CO_HOST' | 'PARTICIPANT' | 'PRESENTER' | 'GUEST';
}

type TabType = 'upcoming' | 'previous' | 'personal-room';

export default function HomeComponent() {
    const [scheduleMeetingFormOpen, setScheduleMeetingFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.token) {
            fetchUserMeetings();
        }
    }, [session]);

    const fetchUserMeetings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/meetings/user/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.token}`,
                },
            });
            if (response.ok) {
                const result = await response.json();
                setMeetings(result.data || []);
            } else {
                errorToast('Failed to fetch meetings');
            }
        } catch (error) {
            errorToast('Error fetching meetings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleMeetingSubmit = async (data: any) => {
        setSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/meetings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.token}`,
                },
                body: JSON.stringify({ topic: data?.topic, description: data?.description, startTime: data?.date, cohosts: data?.coHosts, invitees: data?.invitees }),
            });
            if (!response.ok) {
                errorToast('Failed to schedule meeting');
            }
            if (response.ok) {
                successToast('Meeting scheduled successfully');
                fetchUserMeetings();
            }
        } finally {
            setSaving(false);
            setScheduleMeetingFormOpen(false);
        }
    };

    const tabs: { value: TabType; label: string }[] = [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'previous', label: 'Previous' },
        { value: 'personal-room', label: 'Personal Room' }
    ];

    const formatTimeRange = (startTime: string | Date, endTime?: string | Date) => {
        const formatTime = (time: string | Date) => {
            if (typeof time === 'string') {
                const date = new Date(time);
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
            return '';
        };
        return endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : formatTime(startTime);
    };

    const filterMeetings = (meetings: Meeting[]) => {
        if (activeTab === 'upcoming') {
            return meetings.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
        } else if (activeTab === 'previous') {
            return meetings.filter(m => m.status === 'ENDED' || m.status === 'CANCELLED');
        }
        return meetings;
    };

    const filteredMeetings = filterMeetings(meetings);

    return (
        <>
            <div className="bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meetings</h1>
                    <button
                        onClick={() => setScheduleMeetingFormOpen(true)}
                        className="w-full sm:w-auto text-white gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors flex flex-row items-center justify-center font-medium">
                        <VideoIcon className="w-5 h-5" />
                        <span>Schedule a Meeting</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 md:gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-3 md:px-4 py-2.5 text-sm md:text-base font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab.value
                                    ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Meetings Container */}
                <div className="space-y-4">
                    {/* Section Header - Today */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>

                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-blue-700 rounded-full mx-auto"></div>
                                <p className="text-gray-600 mt-4">Loading meetings...</p>
                            </div>
                        ) : filteredMeetings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredMeetings.map((meeting) => (
                                    <div
                                        key={meeting.meetingId}
                                        className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 flex-1 break-words">
                                                    {meeting.topic}
                                                </h3>
                                                <button className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Time Info */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                <Clock className="w-4 h-4 text-blue-700" />
                                                <span>{formatTimeRange(meeting.startTime, meeting.endTime)}</span>
                                            </div>

                                            {/* Participant Count */}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="w-4 h-4 text-blue-700" />
                                                <span>{meeting.participantCount || meeting.participants?.length || 0} participants</span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4">
                                            {/* Meeting Code */}
                                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1">Meeting ID</p>
                                                <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                                                    {meeting.meetingCode}
                                                </p>
                                            </div>

                                            {/* Status & Role Badge */}
                                            <div className="flex gap-2 mb-4">
                                                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${meeting.status === 'LIVE'
                                                        ? 'bg-red-100 text-red-700'
                                                        : meeting.status === 'SCHEDULED'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {meeting.status}
                                                </span>
                                                {meeting.userRole && (
                                                    <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                                        {meeting.userRole}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer - Action Buttons */}
                                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                                            {meeting.status === 'SCHEDULED' && (
                                                <>
                                                    <button
                                                        onClick={() => router.push(`/meeting/${meeting.meetingCode}`)}
                                                        className="flex-1 px-4 py-2.5 text-blue-700 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 transition-all duration-200 font-medium text-sm"
                                                    >
                                                        Start
                                                    </button>
                                                    <button className="flex-1 px-4 py-2.5 text-indigo-600 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-indigo-200 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-400 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-1.5 group">
                                                        <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button className="flex-1 px-4 py-2.5 text-red-500 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-red-200 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100/50 focus:border-red-400 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-1.5 group">
                                                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </>
                                            )}
                                            {meeting.status === 'LIVE' && (
                                                <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                                                    Join
                                                </button>
                                            )}
                                            {meeting.status === 'ENDED' && (
                                                <button className="flex-1 px-3 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium text-sm">
                                                    Ended
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <VideoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg font-medium">No meetings found</p>
                                <p className="text-gray-500 text-sm">Schedule your first meeting to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {scheduleMeetingFormOpen && (
                <ScheduleMeetingModal
                    isOpen={scheduleMeetingFormOpen}
                    onClose={() => setScheduleMeetingFormOpen(false)}
                    onSubmit={handleScheduleMeetingSubmit}
                    saving={saving}
                    setSaving={setSaving}
                />
            )}
        </>
    );
}