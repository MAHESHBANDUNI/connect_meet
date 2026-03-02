"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMeetingExpirationCronJobs = startMeetingExpirationCronJobs;
exports.stopMeetingExpirationCronJobs = stopMeetingExpirationCronJobs;
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = require("../../drizzle/index.js");
const schema_js_1 = require("../../drizzle/schema.js");
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupHandle = null;
let isRunning = false;
function resolveCleanupIntervalMs() {
    const configured = Number(process.env.MEETING_CLEANUP_INTERVAL_MS);
    if (!Number.isFinite(configured) || configured <= 0) {
        return DEFAULT_INTERVAL_MS;
    }
    return configured;
}
async function expirePastDateMeetings(now) {
    const expiredMeetings = await index_js_1.db
        .update(schema_js_1.meetings)
        .set({
        status: "ENDED",
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_js_1.meetings.status, ["SCHEDULED", "LIVE"]), (0, drizzle_orm_1.lt)(schema_js_1.meetings.endTime, now)))
        .returning({ meetingId: schema_js_1.meetings.meetingId });
    return expiredMeetings.length;
}
async function expireOrphanMeetings(now) {
    const orphanMeetings = await index_js_1.db
        .update(schema_js_1.meetings)
        .set({
        status: "CANCELLED",
        endTime: now,
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_js_1.meetings.status, ["SCHEDULED", "LIVE"]), (0, drizzle_orm_1.sql) `not exists (
          select 1
          from meeting_participants
          where meeting_participants.meeting_id = ${schema_js_1.meetings.meetingId}
            and meeting_participants.participant_role = 'HOST'
            and meeting_participants.user_id is not null
        )`))
        .returning({ meetingId: schema_js_1.meetings.meetingId });
    return orphanMeetings.length;
}
async function runMeetingCleanupCycle(trigger) {
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
            console.log(`[meeting-cron] ${trigger}: expired=${expiredCount}, orphan=${orphanCount}`);
        }
    }
    catch (error) {
        console.error("[meeting-cron] cleanup failed:", error);
    }
    finally {
        isRunning = false;
    }
}
function startMeetingExpirationCronJobs() {
    if (cleanupHandle) {
        return () => stopMeetingExpirationCronJobs();
    }
    const intervalMs = resolveCleanupIntervalMs();
    void runMeetingCleanupCycle("startup");
    cleanupHandle = setInterval(() => {
        void runMeetingCleanupCycle("interval");
    }, intervalMs);
    cleanupHandle.unref?.();
    console.log(`[meeting-cron] started with interval=${intervalMs}ms (pid=${process.pid})`);
    return () => stopMeetingExpirationCronJobs();
}
function stopMeetingExpirationCronJobs() {
    if (!cleanupHandle) {
        return;
    }
    clearInterval(cleanupHandle);
    cleanupHandle = null;
    console.log(`[meeting-cron] stopped (pid=${process.pid})`);
}
//# sourceMappingURL=meeting.cron.js.map