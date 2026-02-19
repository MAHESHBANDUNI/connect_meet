"use client";
import { VideoIcon, Clock, Users, Calendar, Copy, Check, MoreVertical, Edit, Trash2, XCircle, Play } from "lucide-react";
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
    const [copiedId, setCopiedId] = useState<string | null>(null);
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

    const handleCopyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${code}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        successToast('Meeting code copied!');
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

    const tabs: { value: TabType; label: string; count?: number }[] = [
        { value: 'upcoming', label: 'Upcoming', count: meetings.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE').length },
        { value: 'previous', label: 'Previous', count: meetings.filter(m => m.status === 'ENDED' || m.status === 'CANCELLED').length },
        { value: 'personal-room', label: 'Personal Room' }
    ];

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        if (isToday) return `Today at ${timeStr}`;
        if (isTomorrow) return `Tomorrow at ${timeStr}`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (startTime: string, endTime?: string) => {
        if (!endTime) return '';
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end.getTime() - start.getTime();
        const durationMins = Math.round(durationMs / 60000);
        
        if (durationMins < 60) return `${durationMins} min`;
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
    const isHost = (meeting: Meeting) => {
        return meeting.participants?.some(
            p => p.email === session?.user?.email && (p.participantRole === 'HOST' || p.participantRole === 'CO_HOST')
        ) ?? false;
    };

    return (
        <>
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-0.5 sm:px-6 lg:px-8 py-0.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Meetings</h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0 sm:mt-1">
                                    Manage and join your scheduled meetings
                                </p>
                            </div>
                            <button
                                onClick={() => setScheduleMeetingFormOpen(true)}
                                className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <VideoIcon className="w-4 sm:w-6 h-4 sm:h-6 mr-2" />
                                <p className="text-sm sm:text-md">Schedule meeting</p>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 sm:gap-1 mt-4 border-b border-gray-200 mb-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={`relative px-1 sm:px-4 py-0.5 sm:py-2 text-sm font-medium transition-colors ${
                                        activeTab === tab.value
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`ml-0.75 sm:ml-2 px-1 sm:px-2 py-0.5 text-xs rounded-full ${
                                            activeTab === tab.value
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {activeTab === tab.value && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600" />
                            <p className="mt-4 text-sm text-gray-500">Loading meetings...</p>
                        </div>
                    ) : filteredMeetings.length > 0 ? (
                        <div className="space-y-6">
                            {/* Today's meetings section */}
                            {activeTab === 'upcoming' && (
                                <div>
                                    <h2 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                                        Today's meetings
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredMeetings.map((meeting) => (
                                            <MeetingCard
                                                key={meeting.meetingId}
                                                meeting={meeting}
                                                isHost={isHost(meeting)}
                                                onCopy={handleCopyCode}
                                                copiedId={copiedId}
                                                formatDateTime={formatDateTime}
                                                formatDuration={formatDuration}
                                                onJoin={() => router.push(`/meeting/${meeting.meetingCode}`)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All meetings for other tabs */}
                            {activeTab !== 'upcoming' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredMeetings.map((meeting) => (
                                        <MeetingCard
                                            key={meeting.meetingId}
                                            meeting={meeting}
                                            isHost={isHost(meeting)}
                                            onCopy={handleCopyCode}
                                            copiedId={copiedId}
                                            formatDateTime={formatDateTime}
                                            formatDuration={formatDuration}
                                            onJoin={() => router.push(`/meeting/${meeting.meetingCode}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyState 
                            type={activeTab} 
                            onSchedule={() => setScheduleMeetingFormOpen(true)}
                        />
                    )}
                </div>
            </div>

            <ScheduleMeetingModal
                isOpen={scheduleMeetingFormOpen}
                onClose={() => setScheduleMeetingFormOpen(false)}
                onSubmit={handleScheduleMeetingSubmit}
                saving={saving}
                setSaving={setSaving}
            />
        </>
    );
}

// Extracted Meeting Card Component
function MeetingCard({ 
    meeting, 
    isHost, 
    onCopy, 
    copiedId, 
    formatDateTime, 
    formatDuration,
    onJoin 
}: { 
    meeting: Meeting;
    isHost: boolean;
    onCopy: (code: string, id: string) => void;
    copiedId: string | null;
    formatDateTime: (date: string) => string;
    formatDuration: (start: string, end?: string) => string;
    onJoin: () => void;
}) {
    const [showActions, setShowActions] = useState(false);

    const statusStyles = {
        LIVE: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
        SCHEDULED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
        ENDED: 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20',
        CANCELLED: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20'
    };

    const statusLabels = {
        LIVE: 'Live now',
        SCHEDULED: 'Scheduled',
        ENDED: 'Ended',
        CANCELLED: 'Cancelled'
    };

    return (
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
            {/* Status Bar */}
            <div className={`h-1 ${
                meeting.status === 'LIVE' ? 'bg-red-500' :
                meeting.status === 'SCHEDULED' ? 'bg-blue-500' :
                meeting.status === 'ENDED' ? 'bg-gray-300' : 'bg-orange-500'
            }`} />

            <div className="p-2 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-md font-semibold text-gray-900 truncate pr-4 ">
                            {meeting.topic}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 sm:mt-1">
                            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium ${statusStyles[meeting.status]}`}>
                                {statusLabels[meeting.status]}
                            </span>
                            {meeting.userRole && meeting.userRole !== 'PARTICIPANT' && (
                                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-purple-600/20">
                                    {meeting.userRole}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {showActions && (
                            <>
                                <div 
                                    className="fixed inset-0 z-20"
                                    onClick={() => setShowActions(false)}
                                />
                                <div className="absolute right-0 mt-1 w-36 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                                    {isHost && meeting.status === 'SCHEDULED' && (
                                        <>
                                            <button className="w-full px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2">
                                                <Edit className="w-3 sm:w-4 h-3 sm:h-4" />
                                                Edit meeting
                                            </button>
                                            <button className="w-full px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5 sm:gap-2">
                                                <XCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                                Cancel meeting
                                            </button>
                                            <div className="border-t border-gray-100 my-1" />
                                        </>
                                    )}
                                    <button className="w-full px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2">
                                        <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                                        View participants
                                    </button>
                                    {isHost && (
                                        <button className="w-full px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2">
                                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Meeting Details */}
                <div className="space-y-2 sm:space-y-3 mb-2.5 sm:mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span>{formatDateTime(meeting.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span>{formatDuration(meeting.startTime, meeting.endTime) || 'No duration set'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span>{meeting.participantCount || 0} participants</span>
                    </div>
                </div>

                {/* Meeting Code */}
                <div className="mb-2.5 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold sm:font-medium text-gray-500 uppercase tracking-wider">
                            Meeting ID
                        </span>
                        <button
                            onClick={() => onCopy(meeting.meetingCode, meeting.meetingId)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold sm:font-medium flex items-center gap-1"
                        >
                            {copiedId === meeting.meetingId ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <p className="font-mono text-xs sm:text-sm font-medium text-gray-900 mt-1">
                        {meeting.meetingCode}
                    </p>
                </div>

                {/* Actions */}
                {meeting.status === 'SCHEDULED' && (
                    <div className="flex gap-2">
                        <button
                            onClick={onJoin}
                            className="flex-1 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isHost ? 'Start meeting' : 'Join meeting'}
                        </button>
                        {isHost && (
                            <button className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                                <Edit className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                            </button>
                        )}
                    </div>
                )}

                {meeting.status === 'LIVE' && (
                    <button
                        onClick={onJoin}
                        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Join live meeting
                    </button>
                )}

                {meeting.status === 'ENDED' && (
                    <div className="px-4 py-2.5 bg-gray-50 text-gray-500 text-sm font-medium rounded-lg text-center border border-gray-200">
                        Meeting ended
                    </div>
                )}
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ type, onSchedule }: { type: TabType; onSchedule: () => void }) {
    const messages = {
        upcoming: {
            title: 'No upcoming meetings',
            description: 'Schedule a meeting to get started with your team.'
        },
        previous: {
            title: 'No previous meetings',
            description: 'Your past meetings will appear here.'
        },
        'personal-room': {
            title: 'Your personal meeting room',
            description: 'Start or schedule a meeting in your personal room.'
        }
    };

    return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <VideoIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
                {messages[type].title}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
                {messages[type].description}
            </p>
            {type === 'upcoming' && (
                <button
                    onClick={onSchedule}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Schedule a meeting
                </button>
            )}
        </div>
    );
}