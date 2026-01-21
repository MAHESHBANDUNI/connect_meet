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
export declare const sendMeetingInvite: (user: IUser, meeting: IMeetingDetails) => Promise<{
    success: boolean;
    message: string;
}>;
export {};
//# sourceMappingURL=emailHandler.d.ts.map