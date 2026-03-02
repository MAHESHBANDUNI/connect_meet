"use client";

import { MessageSquare, MessagesSquare, UserPlus, UserCheck, UserX, X } from "lucide-react";
import { MeetingEventPopup } from "@/app/hooks/useWebRTC";

interface MeetingEventPopupsProps {
  events: MeetingEventPopup[];
  onDismiss: (id: string) => void;
}

const iconByType = {
  "direct-message": MessageSquare,
  "group-message": MessagesSquare,
  "join-request": UserPlus,
  "participant-joined": UserCheck,
  "participant-left": UserX,
} as const;

const styleByType = {
  "direct-message": "border-blue-500/30 bg-blue-500/10 text-blue-300",
  "group-message": "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  "join-request": "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  "participant-joined": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "participant-left": "border-orange-500/30 bg-orange-500/10 text-orange-300",
} as const;

export function MeetingEventPopups({ events, onDismiss }: MeetingEventPopupsProps) {
  return (
    <div className="pointer-events-none fixed right-2.5 sm:right-4 top-14 sm:top-20 z-40 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {events.map((event) => {
        const Icon = iconByType[event.type];
        const colorClass = styleByType[event.type];

        return (
          <div
            key={event.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${colorClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-black/20 p-1.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/80">{event.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(event.id)}
                className="rounded-md p-1 text-white/70 hover:bg-black/20 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
