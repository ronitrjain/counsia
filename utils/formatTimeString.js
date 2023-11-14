function formatTimeString(dateTimeString, type) {

    // Create a Date object from the input string
    const inputDate = new Date(dateTimeString);
    //turn inputDate into UTC
    // Get the target offset as the browser's local time zone offset in minutes
    const targetOffset = inputDate.getTimezoneOffset();
    // Calculate the time difference between the current and target offsets in milliseconds
    const offsetDifference = targetOffset * 60 * 1000;

    // Adjust the date-time by adding the offset difference
    inputDate.setTime(inputDate.getTime() - offsetDifference);

    //add client
    inputDate.setTime(inputDate.getTime());

    // Convert the updated date-time back to a string
    const updatedDateTimeString = inputDate.toISOString();

    if (type == "date") {
        return updatedDateTimeString.slice(0, 10);
    }
    else if (type == "time") {
        if (updatedDateTimeString.slice(11, 13) > 12) {
            return (updatedDateTimeString.slice(11, 13) - 12) + updatedDateTimeString.slice(13, 16) + " PM";
        }
        return updatedDateTimeString.slice(11, 16) + " AM";
    }
    else {
        return updatedDateTimeString;
    }

}


export default formatTimeString;