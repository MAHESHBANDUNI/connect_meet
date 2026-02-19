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
                {/* Header - Improved mobile responsiveness */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="w-full sm:w-auto">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
                                    Meetings
                                </h1>
                                <p className="text-sm sm:text-base text-gray-500 mt-1">
                                    Manage and join your scheduled meetings
                                </p>
                            </div>
                            <button
                                onClick={() => setScheduleMeetingFormOpen(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
                            >
                                <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Schedule meeting
                            </button>
                        </div>

                        {/* Tabs - Horizontal scroll on mobile */}
                        <div className="relative mt-6">
                            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`relative px-4 py-2 sm:px-6 sm:py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                                            activeTab === tab.value
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tab.label}
                                        {tab.count !== undefined && tab.count > 0 && (
                                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                                activeTab === tab.value
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {/* Active tab indicator for desktop */}
                            <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{
                                        width: `${100 / tabs.length}%`,
                                        transform: `translateX(${tabs.findIndex(t => t.value === activeTab) * 100}%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Improved grid responsiveness */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-600" />
                            <p className="mt-4 text-sm sm:text-base text-gray-500">Loading meetings...</p>
                        </div>
                    ) : filteredMeetings.length > 0 ? (
                        <div className="space-y-8">
                            {/* Today's meetings section */}
                            {activeTab === 'upcoming' && (
                                <div>
                                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 px-1">
                                        Today's meetings
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
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

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
}

// Extracted Meeting Card Component - Fully responsive
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
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
            {/* Status Bar */}
            <div className={`h-1.5 ${
                meeting.status === 'LIVE' ? 'bg-red-500' :
                meeting.status === 'SCHEDULED' ? 'bg-blue-500' :
                meeting.status === 'ENDED' ? 'bg-gray-300' : 'bg-orange-500'
            }`} />

            <div className="p-4 sm:p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 pr-2">
                            {meeting.topic}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusStyles[meeting.status]}`}>
                                {statusLabels[meeting.status]}
                            </span>
                            {meeting.userRole && meeting.userRole !== 'PARTICIPANT' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-purple-600/20">
                                    {meeting.userRole}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Actions Menu - Improved for mobile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="More options"
                        >
                            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        {showActions && (
                            <>
                                <div 
                                    className="fixed inset-0 z-20 bg-black/20 sm:hidden"
                                    onClick={() => setShowActions(false)}
                                />
                                <div className="absolute right-0 mt-1 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-30">
                                    {isHost && meeting.status === 'SCHEDULED' && (
                                        <>
                                            <button className="w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                                <Edit className="w-4 h-4" />
                                                Edit meeting
                                            </button>
                                            <button className="w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-3">
                                                <XCircle className="w-4 h-4" />
                                                Cancel meeting
                                            </button>
                                            <div className="border-t border-gray-100 my-1" />
                                        </>
                                    )}
                                    <button className="w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                        <Users className="w-4 h-4" />
                                        View participants
                                    </button>
                                    {isHost && (
                                        <button className="w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Meeting Details */}
                <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{formatDateTime(meeting.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{formatDuration(meeting.startTime, meeting.endTime) || 'No duration set'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{meeting.participantCount || 0} participants</span>
                    </div>
                </div>

                {/* Meeting Code */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Meeting ID
                        </span>
                        <button
                            onClick={() => onCopy(meeting.meetingCode, meeting.meetingId)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                        >
                            {copiedId === meeting.meetingId ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    <span className="hidden xs:inline">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    <span className="hidden xs:inline">Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                    <p className="font-mono text-sm font-medium text-gray-900 mt-1 break-all">
                        {meeting.meetingCode}
                    </p>
                </div>

                {/* Actions - Responsive buttons */}
                {meeting.status === 'SCHEDULED' && (
                    <div className="flex gap-2">
                        <button
                            onClick={onJoin}
                            className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {isHost ? 'Start Meeting' : 'Join Meeting'}
                        </button>
                        {isHost && (
                            <button className="px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {meeting.status === 'LIVE' && (
                    <button
                        onClick={onJoin}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Join live
                    </button>
                )}

                {meeting.status === 'ENDED' && (
                    <div className="px-4 py-3 bg-gray-50 text-gray-500 text-sm font-medium rounded-lg text-center border border-gray-200">
                        Meeting ended
                    </div>
                )}
            </div>
        </div>
    );
}

// Empty State Component - Responsive
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
        <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-4 sm:mb-6">
                <VideoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2">
                {messages[type].title}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                {messages[type].description}
            </p>
            {type === 'upcoming' && (
                <button
                    onClick={onSchedule}
                    className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-xl transition-colors shadow-sm hover:shadow"
                >
                    <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Schedule a meeting
                </button>
            )}
        </div>
    );
}