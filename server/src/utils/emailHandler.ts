import nodemailer, { Transporter } from 'nodemailer';
import {BadRequestError} from './errorHandler';

interface IUser {
  email: string;
  firstName: string;
  lastName: string;
}

interface IMeetingDetails {
  topic: string;
  description: string;
  startTime: Date;
  meetingLink: string;
}

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateICS = (
  user: IUser,
  meeting: IMeetingDetails
): string => {
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

export const sendMeetingInvite = async (
  user: IUser,
  meeting: IMeetingDetails
): Promise<{ success: boolean; message: string }> => {
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
  } catch (error) {
    console.error('Error sending meeting invite:', error);
    throw new BadRequestError('Failed to send meeting invite.');
  }
};
