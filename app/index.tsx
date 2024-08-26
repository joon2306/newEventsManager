import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Agenda } from "react-native-calendars";
import { Event, EVENT_TYPE, EventCalendarItems } from "../model/Event";
import { useCallback, useState } from "react";
import { format } from "date-fns";
import eventsService from "../service/EventsService";
import EventUtils from "../utils/EventUtils";
import _ from 'lodash';

export default function Home() {

    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const [events, setEvents] = useState({});

    const [fetchError, setFetchError] = useState(false);

    const initEvents = () => {
        eventsService.fetchEvents().then(({ data, error }) => {
            if (error != null) {
                console.error("Error fetching events:", error);
                setFetchError(true);
                return;
            }
            const builtEvents = EventUtils.buildEvents(data);
            setEvents(builtEvents);
        });
    }

    const setActiveDate = (date: string) => {
        const findMissingDate = (events: EventCalendarItems) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to beginning of the day for accurate comparison

            let currentDate = new Date(today);

            while (true) {
                const dateString = currentDate.toISOString().split('T')[0]; // Get date string in YYYY-MM-DD format

                if (!(dateString in events)) {
                    return dateString;
                }

                currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
            }
        }

        const missingDate = findMissingDate(events);
        setSelectedDate(missingDate);
        setTimeout(() => setSelectedDate(date), 0);
    }

    const handleDayPress = (day: any) => {
        setActiveDate(day.dateString);
    };

    const handleRenderItem = (item: Event) => {
        const { eventType, title } = item;

        const type = EVENT_TYPE[eventType as keyof typeof EVENT_TYPE];

        const edit = (item: Event) => {
            // navigation.navigate('Add Event', { eventDate: selectedDate, eventName: item.title, eventType: item.eventType, eventDescription: item.description, eventId: item.id });
            console.log(item);
        }


        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <TouchableOpacity onLongPress={() => edit(item)}>
                    <Text>{title.toUpperCase()}</Text>
                    <Text>{type.toLowerCase()}</Text>
                </TouchableOpacity>
            </View>
        )
    }


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        centeredText: {
            textAlign: 'center',
        }
    });

    useFocusEffect(
        useCallback(() => {
            initEvents();  // This will run every time the screen comes into focus

            return () => {
                // Cleanup if necessary
            };
        }, [])
    );

    return (
        <View style={{ flex: 1 }}>

            {
                _.isEmpty(events) && !fetchError && (
                    <View style={styles.container}>
                        <Text style={styles.centeredText}>Loading events...</Text>
                    </View>
                )
            }

            {
                fetchError && (
                    <View style={styles.container}>
                        <Text style={styles.centeredText}>Connection Error... Try Later</Text>
                    </View>
                )
            }

            {!_.isEmpty(events) && !fetchError && (
                <Agenda
                    items={events}
                    renderItem={handleRenderItem}
                    selected={selectedDate}
                    onDayPress={handleDayPress}
                    showOnlySelectedDayItems={true}
                    showClosingKnob={true}
                    renderEmptyData={() => {
                        return (
                            <View style={styles.container}>
                                <Text style={styles.centeredText}>No Events</Text>
                            </View>
                        )
                    }}
                />
            )}
        </View>
    )

}