import { parse } from "date-fns";
import { Event, EventCalendarItems } from "../model/Event";

const EventUtils = {

    buildEvents: (serverData: Event[]) => {
        const events: EventCalendarItems = {};
        serverData.forEach((event: Event) => {
            const { startDate } = event;
            if (!events[startDate]) {
                events[startDate] = [];
                events[startDate].push(event);

            } else {
                events[startDate].push(event);
            }

        });

        return events;

    },

    handleDateConversion: (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+04:00`;

    },
    getDate: (txt: string) => {
        const dateFormats = [
            'yyyy-MM-dd',
            'dd-MM-yyyy',
            'MM-dd-yyyy',
            'yyyy/MM/dd',
            'dd/MM/yyyy',
            'MM/dd/yyyy'
        ];

        for (let dateFormat of dateFormats) {
            const parsedDate = parse(txt, dateFormat, new Date());
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate; // Return the parsed date if successful
            }
        }
        return null
    },
    isYear: (txt: string) => {
        const regex = /^\d{4}$/;
        return regex.test(txt);
    },
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


}

export default EventUtils;