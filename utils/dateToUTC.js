function datetoUTC(dateString) {
    // Create a new Date object from the input string
    const inputDate = new Date(dateString);

    // Get the UTC timestamp of the input date
    const utcTimestamp = Date.UTC(
        inputDate.getUTCFullYear(),
        inputDate.getUTCMonth(),
        inputDate.getUTCDate(),
        inputDate.getUTCHours(),
        inputDate.getUTCMinutes(),
        inputDate.getUTCSeconds()
    );

    // Create a new Date object from the UTC timestamp
    const utcDate = new Date(utcTimestamp);

    return utcDate;
}

export default datetoUTC;