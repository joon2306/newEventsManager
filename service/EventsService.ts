import supabase, { databaseName } from "../config/config";
import { Event } from "../model/Event";

let eventsInstance: EventsService | null = null;
class EventsService {

    constructor() {
        if (eventsInstance === null) {
            eventsInstance = this;
        }
        return eventsInstance;
    }

    async fetchEvents() {
        return await supabase.from(databaseName).select("*");
    }

    async saveEvent({ title, description, startDate, eventType, id }: Event) {
        if (id) {
            return await this.updateEvent({ id, title, description, startDate, eventType });
        }

        return await supabase.from(databaseName).insert([
            {
                title,
                description,
                startDate,
                eventType
            }
        ]).select();
    }

    async updateEvent({ title, description, startDate, eventType, id }: Event) {
        return await supabase.from(databaseName).update({
            title,
            description,
            startDate,
            eventType
        }).eq('id', id).select();
    }

    async deleteEventById(id: number) {
        return await supabase.from(databaseName).delete().eq('id', id).select();
    }


}

const eventsService = new EventsService();
export default eventsService;