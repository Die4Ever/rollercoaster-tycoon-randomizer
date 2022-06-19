const MONTHS = ["March", "April", "May", "June", "July", "August", "September", "October"];

function formatDate(day: number, month: number, year: number) {
    return `${MONTHS[month]} ${day}, Year ${year}`
}