import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "../../drizzle/index.js";
import { meetingParticipants, meetings } from "../../drizzle/schema.js";

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;// 5 minutes

let cleanupHandle: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

function resolveCleanupIntervalMs(): number {
  const configured = Number(process.env.MEETING_CLEANUP_INTERVAL_MS);

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_INTERVAL_MS;
  }

  return configured;
}

async function expirePastDateMeetings(now: Date): Promise<number> {
  const expiredMeetings = await db
    .update(meetings)
    .set({
      status: "ENDED",
    })
    .where(
      and(
        inArray(meetings.status, ["SCHEDULED", "LIVE"]),
        lt(meetings.endTime, now)
      )
    )
    .returning({ meetingId: meetings.meetingId });

  return expiredMeetings.length;
}

async function expireOrphanMeetings(now: Date): Promise<number> {
  const orphanMeetings = await db
    .update(meetings)
    .set({
      status: "CANCELLED",
      endTime: now,
    })
    .where(
      and(
        inArray(meetings.status, ["SCHEDULED", "LIVE"]),
        sql`not exists (
          select 1
          from meeting_participants
          where meeting_participants.meeting_id = ${meetings.meetingId}
            and meeting_participants.participant_role = 'HOST'
            and meeting_participants.user_id is not null
        )`
      )
    )
    .returning({ meetingId: meetings.meetingId });

  return orphanMeetings.length;
}

async function runMeetingCleanupCycle(trigger: "startup" | "interval") {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const now = new Date();
    const [expiredCount, orphanCount] = await Promise.all([
      expirePastDateMeetings(now),
      expireOrphanMeetings(now),
    ]);

    if (expiredCount > 0 || orphanCount > 0) {
      console.log(
        `[meeting-cron] ${trigger}: expired=${expiredCount}, orphan=${orphanCount}`
      );
    }
  } catch (error) {
    console.error("[meeting-cron] cleanup failed:", error);
  } finally {
    isRunning = false;
  }
}

export function startMeetingExpirationCronJobs() {
  if (cleanupHandle) {
    return () => stopMeetingExpirationCronJobs();
  }

  const intervalMs = resolveCleanupIntervalMs();

  void runMeetingCleanupCycle("startup");

  cleanupHandle = setInterval(() => {
    void runMeetingCleanupCycle("interval");
  }, intervalMs);

  cleanupHandle.unref?.();

  console.log(
    `[meeting-cron] started with interval=${intervalMs}ms (pid=${process.pid})`
  );

  return () => stopMeetingExpirationCronJobs();
}

export function stopMeetingExpirationCronJobs() {
  if (!cleanupHandle) {
    return;
  }

  clearInterval(cleanupHandle);
  cleanupHandle = null;
  console.log(`[meeting-cron] stopped (pid=${process.pid})`);
}
