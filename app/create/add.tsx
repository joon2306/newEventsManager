import { Text, View } from "react-native";
import EventForm from "../../components/EventForm";
import { PaperProvider } from "react-native-paper";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { Event } from "../../model/Event";
import { parseISO } from 'date-fns';

export default function Add() {
    const { id, title, description, startDate, eventType } = (useGlobalSearchParams() as unknown) as Event;
    let isEdit = false;
    let eventDate = undefined;

    if (id) {
        isEdit = true;
        eventDate = parseISO(startDate);
    }
    return (
        <PaperProvider>
            <EventForm eventName={title} eventDate={eventDate} eventDescription={description} eventId={id} initialEventType={eventType} isEdit={isEdit} />
        </PaperProvider>
    )
}