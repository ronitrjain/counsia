function addOneHour(dateString) {
    // Create a Date object from the input string
    const inputDate = new Date(dateString);

    // Add one hour (in milliseconds)
    inputDate.setTime(inputDate.getTime() + 60 * 60 * 1000);

    return inputDate;
}

export default addOneHour;