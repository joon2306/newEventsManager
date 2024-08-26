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

