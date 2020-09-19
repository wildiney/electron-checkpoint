export function formatHour(hour: string) {
    let h = hour.getHours() < 10 ? '0' + hour.getHours() : hour.getHours()
    let m = hour.getMinutes() < 10 ? '0' + hour.getMinutes() : hour.getMinutes()
    return `${h}:${m}`;
}

export function formatMomentJSTime(h, m) {
    const hours = h < 10 ? `0${h}` : `${h}`
    const minutes = m < 10 ? `0${m}` : `${m}`
    return `${hours}:${minutes}`
}
