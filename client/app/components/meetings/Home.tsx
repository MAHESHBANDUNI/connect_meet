"use client";
import { VideoIcon } from "lucide-react";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { errorToast, successToast } from "../ui/toast";

export default function HomeComponent() {
    const [scheduleMeetingFormOpen, setScheduleMeetingFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const { data: session } = useSession();

    const handleScheduleMeetingSubmit = async (data: any) => {
        setSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/meetings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.token}`,
                },
                body: JSON.stringify({topic: data?.topic, startTime: data?.date, cohosts: data?.coHosts, invitees: data?.invitees}),
            });
            if (!response.ok) {
                errorToast('Failed to schedule meeting');
            }
            if(response.ok){
                successToast('Meeting scheduled successfully');
            }
        } finally {
            setSaving(false);
            setScheduleMeetingFormOpen(false);
        }
    };

    return (
        <>
            <div className="bg-gray-100 min-h-[85vh] p-4">
                <div className="flex justify-between w-full h-fit">
                    <h1 className="text-2xl font-bold text-gray-800">Meetings</h1>
                    <button 
                        onClick={()=>setScheduleMeetingFormOpen(true)}
                        className="text-white gap-2 ml-auto mr-4 px-2 py-2 bg-green-700 rounded-xl hover:bg-green-800 transition flex flex-row items-center">
                        <VideoIcon className="w-8 h-8 mr-1" />
                        Schedule a Meeting
                    </button>
                </div>  
                <div></div>
                <div></div>   
            </div>
            {scheduleMeetingFormOpen && <ScheduleMeetingModal isOpen={scheduleMeetingFormOpen} onClose={() => setScheduleMeetingFormOpen(false)} onSubmit={handleScheduleMeetingSubmit} saving={saving} setSaving={setSaving} />}
        </>
    )
}