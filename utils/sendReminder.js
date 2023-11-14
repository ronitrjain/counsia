import Meeting from "../models/Meeting.js";
import sendEmail from "./sendEmail2.js";
export default async function sendReminder() {

    try {
        //check
        console.log("sendReminder function called");
        //get current date and time
        let now = new Date();
        const oneHourLater = new Date(now);
        oneHourLater.setHours(now.getHours() + 1);
        let meetings = await Meeting.find({
            start: {
                $gte: now, // 'start' is greater than or equal to the current time
                $lt: oneHourLater, // 'start' is less than one hour from now
            }
        }).populate("user").populate("counselor");

        console.log(meetings)


        for (let meeting of meetings) {

            sendEmail(meeting.user.email, "Reminder: Meeting with " + meeting.counselor.first_name, "meeting_reminder.html", { name: meeting.counselor.first_name, date: meeting.start, link: meeting.zoom_meeting_link })
            sendEmail(meeting.counselor.email_address, "Reminder: Meeting with " + meeting.user.firstName, "meeting_reminder.html", { name: meeting.user.firstName, date: meeting.start, link: meeting.zoom_meeting_link })

        }
    } catch (err) {
        console.log("Error in sendReminder function" + err)
    }



}