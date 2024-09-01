export interface Event {
    id: number,
    title: string,
    description: string,
    startDate: string,
    eventType: number
}

export const EVENT_TYPE = {
    1: "FULL_DAY",
    2: "HALF_DAY"
} as const;

export type EventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];

export interface EventCalendarItems {
    [date: string]: Event[]
}

export interface EventServerResponse {
    data: Event[],
    error: string | null
}


export interface AddEvent {
    eventName: string,
    eventDate: Date | undefined,
    eventDescription:string,
    eventId: number,
    initialEventType: number,
    isEdit: boolean
}
