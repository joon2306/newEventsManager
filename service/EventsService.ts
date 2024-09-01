import supabase, { databaseName } from "../config/config";
import { Event, EventServerResponse } from "../model/Event";

let eventsInstance: EventsService | null = null;
class EventsService {

    constructor() {
        if (eventsInstance === null) {
            eventsInstance = this;
        }
        return eventsInstance;
    }

    async fetchEvents(): Promise<EventServerResponse> {
        return await supabase.from(databaseName).select("*") as EventServerResponse;
    }

    async saveEvent({ title, description, startDate, eventType, id }: Event): Promise<EventServerResponse> {
        if (id) {
            return await this.updateEvent({ id, title, description, startDate, eventType }) as EventServerResponse;
        }

        return await supabase.from(databaseName).insert([
            {
                title,
                description,
                startDate,
                eventType
            }
        ]).select() as EventServerResponse;
    }

    async updateEvent({ title, description, startDate, eventType, id }: Event): Promise<EventServerResponse> {
        return await supabase.from(databaseName).update({
            title,
            description,
            startDate,
            eventType
        }).eq('id', id).select() as EventServerResponse;;
    }

    async deleteEventById(id: number): Promise<EventServerResponse> {
        return await supabase.from(databaseName).delete().eq('id', id).select() as EventServerResponse;;
    }


}

const eventsService = new EventsService();
export default eventsService;