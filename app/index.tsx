import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Agenda } from "react-native-calendars";
import { Event, EVENT_TYPE, EventCalendarItems } from "../model/Event";
import { useCallback, useState } from "react";
import { format } from "date-fns";
import eventsService from "../service/EventsService";
import EventUtils from "../utils/EventUtils";
import _ from 'lodash';
import { Banner, ModalAlert } from "../components/common/commonComponents";
import { Button, PaperProvider, Searchbar } from "react-native-paper";

export default function Home() {

    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [events, setEvents] = useState({});
    const [fetchError, setFetchError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState<any>('');
    const [isBannerVisible, setBannerVisible] = useState(false);
    const [bannerMsg, setBannerMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);



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

    const addLoader = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }

    const notify = (msg: string) => {
        setBannerMsg(msg);
        setBannerVisible(true);
        setTimeout(() => setBannerVisible(false), 1000);
    }

    const handleSearch = () => {
        const findEventDates = (txt: string) => {
            if (_.isEmpty(txt)) {
                return {};
            }
            txt = txt.toLowerCase();
            const eventMap: EventCalendarItems = {};
            _.forOwn(events, (event: Event[], date) => {
                const eventFound = event.some(e => e.title && e.title.toLowerCase().indexOf(txt) > -1);
                if (eventFound) {
                    eventMap[date] = event;
                }
            });
            return eventMap;
        }

        const buildDateList = (eventMap: EventCalendarItems) => {
            const handleDateClick = (date: string) => {
                // Do something when a date is clicked
                setModalVisible(false);
                setActiveDate(date);
            };
    
            // Convert the eventMap object into an array of React elements
            const dateElements = [] as any;
            for (const date in eventMap) {
                const events = eventMap[date];
                events.forEach(({ title }) => {
                    dateElements.push(
                        <TouchableOpacity key={EventUtils.generateUUID()} onPress={() => handleDateClick(date)} >
                            <Text style={{ marginVertical: 5 }}>{title}</Text>
                        </TouchableOpacity>
                    );
                });
            }
    
            return (
                <View style={{ maxWidth: 200, maxHeight: 200 }}>
                    <ScrollView style={{ flex: 1 }}>
                        {dateElements}
                    </ScrollView>
                </View>
            );
        };

        const date = EventUtils.getDate(searchQuery);
        if (date !== null) {
            addLoader();
            setActiveDate(format(date, "yyyy-MM-dd"));
            return;
        } else if (EventUtils.isYear(searchQuery)) {
            addLoader();
            const year = Number(searchQuery);
            setActiveDate(format(new Date(year, 0, 1), "yyyy-MM-dd"));
            return;
        } else {
            const eventDates = findEventDates(searchQuery);
            if (!_.isEmpty(eventDates)) {
                const keys = Object.keys(eventDates);
                if (keys.length > 1) {
                    setModalMessage(buildDateList(eventDates));
                    setModalVisible(true);
                } else {
                    setActiveDate(keys[0]);
                }
            } else {
                notify("No event found");
            }
        }
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
        <PaperProvider>

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

            <ModalAlert modalVisible={modalVisible} setModalVisible={setModalVisible} modalMessage={modalMessage} hideBtn={true} callback={_.noop} ></ModalAlert>

            {
                !_.isEmpty(events) && !fetchError && (
                    <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                        <Banner message={bannerMsg} isVisible={isBannerVisible} />
                        <Button icon="calendar-plus" mode="outlined" style={{ marginHorizontal: 20 }} onPress={() => console.log("Btn Add clicked")}> Add</Button>
                        <Searchbar
                            placeholder="Search"
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            onIconPress={handleSearch}
                            style={{ margin: 20 }}
                        />
                    </View>
                )
            }
        </PaperProvider>
    )

}