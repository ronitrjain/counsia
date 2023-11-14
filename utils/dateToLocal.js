function dateToLocal(dateString) {
    // Create a new Date object from the input string
    const utcDate = new Date(dateString);

    // Get the local date by adding the local time zone offset
    const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);

    return localDate;
}

export default dateToLocal;