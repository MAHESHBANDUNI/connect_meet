"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMeetingInvite = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const errorHandler_1 = require("./errorHandler");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const generateICS = (user, meeting) => {
    const start = meeting.startTime.toISOString().replace(/[-:]/g, '').split('.')[0];
    return `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@connectmeet.com
DTSTAMP:${start}Z
DTSTART:${start}Z
SUMMARY:${meeting.topic}
DESCRIPTION:${meeting.description}\\nMeeting Link: ${meeting.meetingLink}
ORGANIZER;CN=Connect Meet:MAILTO:${process.env.SMTP_FROM}
ATTENDEE;CN=${user.firstName} ${user.lastName};RSVP=TRUE:MAILTO:${user.email}
LOCATION:Online
END:VEVENT
END:VCALENDAR
`.trim();
};
const sendMeetingInvite = async (user, meeting) => {
    const icsContent = generateICS(user, meeting);
    const mailOptions = {
        from: `"Connect Meet" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: `Meeting Invitation: ${meeting.topic}`,
        html: `
      <p>Dear ${user.firstName} ${user.lastName},</p>

      <p>You are invited to the following meeting:</p>

      <ul>
        <li><strong>Title:</strong> ${meeting.topic}</li>
        <li><strong>Description:</strong> ${meeting.description}</li>
        <li><strong>Date:</strong> ${meeting.startTime.toLocaleDateString()}</li>
        <li><strong>Meeting Link:</strong> <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></li>
      </ul>

      <p>Please find the calendar invite attached.</p>

      <p>Best regards,<br/>Connect Meet Team</p>
    `,
        alternatives: [
            {
                contentType: 'text/calendar; charset="utf-8"; method=REQUEST',
                content: icsContent,
            },
        ],
    };
    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Meeting invite sent successfully.' };
    }
    catch (error) {
        console.error('Error sending meeting invite:', error);
        throw new errorHandler_1.BadRequestError('Failed to send meeting invite.');
    }
};
exports.sendMeetingInvite = sendMeetingInvite;
//# sourceMappingURL=emailHandler.js.map