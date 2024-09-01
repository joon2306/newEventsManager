import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Provider, Menu, Button, PaperProvider } from 'react-native-paper'; // Import Provider and Menu
import DateTimePicker from '@react-native-community/datetimepicker';
import { Banner, ModalAlert } from './common/commonComponents';
import { router } from 'expo-router';
import eventsService from '../service/EventsService';
import EventUtils from '../utils/EventUtils';
import { AddEvent, EventServerResponse } from '../model/Event';

const EventForm = ({ eventName: initialEventName = '', eventDate: initialEventDate = new Date(),
    eventDescription: initialEventDescription = '', initialEventType = 1, isEdit = false, eventId = 0 }: AddEvent) => {
    const [eventName, setEventName] = useState(initialEventName);
    const [eventDate, setEventDate] = useState(initialEventDate);
    const [description, setDescription] = useState(initialEventDescription);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [bannerVisible, setBannerVisible] = useState(false);
    const [bannerMsg, setBannerMsg] = useState("");
    const [modalCb, setModalCb] = useState<any>(undefined);
    const [dayType, setDayType] = useState(initialEventType); // State to manage the selected option

    // Menu state
    const [visible, setVisible] = useState(false);

    const handleEventDateChange = (event, selectedDate: any) => {
        const currentDate = selectedDate || eventDate;
        setShowDatePicker(Platform.OS === 'ios');

        setEventDate(currentDate);
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const handleSave = ({ error }: EventServerResponse) => {
        if (error !== null) {
            handleError();
            return;
        }
        const msg = isEdit ? 'Event edited' : 'Event saved';
        setBannerMsg(msg);
        completeAndRedirect();
    }

    const handleSubmit = () => {
        if (!eventName || !eventDate || !description) {
            setModalMessage('All fields are required.');
            setModalVisible(true);
            setModalCb(undefined);
            return;
        }

        if (eventDate < new Date()) {
            setModalMessage('Date cannot be in the past.');
            setModalVisible(true);
            setModalCb(undefined);
            return;
        }

        eventsService.saveEvent({ title: eventName, description, startDate: EventUtils.handleDateConversion(eventDate), eventType: dayType, id: eventId })
            .then(handleSave);
    };

    const handleError = () => {
        setBannerMsg("Connection error...");
        setBannerVisible(true);
    }

    const completeAndRedirect = () => {
        setBannerVisible(true);
        setTimeout(() => {
            router.back();
            setBannerVisible(false);
        }, 1000);
    }

    const handleDelete = () => {
        const deleteCb = () => {
            eventsService.deleteEventById(eventId).then(({ data, error }) => {
                if (error !== null) {
                    handleError();
                    return;
                }

                setBannerMsg("Event deleted");
                completeAndRedirect();
            })
        }

        setModalCb(() => deleteCb);

        setModalMessage("Are you sure you want to delete this event?")
        setModalVisible(true);

    }

    const displayBtn = () => {
        if (!isEdit) {
            return <Button icon="calendar-plus" mode="outlined" style={{ marginHorizontal: 20 }} onPress={handleSubmit}> Add</Button>
        }
        return (
            <View>
                <Button icon="calendar-plus" mode="outlined" style={{ marginVertical: 10 }} onPress={handleSubmit}> Edit</Button>
                <Button icon="calendar-plus" mode="outlined" onPress={handleDelete}> Delete</Button>
            </View>
        )
    }

    return (
        <Provider>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder="Event Name"
                        onChangeText={(text) => setEventName(text)}
                        value={eventName}
                    />
                    <TouchableOpacity style={styles.input} onPress={showDatePickerModal}>
                        <Text>{eventDate.toDateString()}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={eventDate}
                            mode="date"
                            is24Hour={true}
                            display="default"
                            onChange={handleEventDateChange}
                        />
                    )}
                    <Menu
                        visible={visible}
                        onDismiss={() => setVisible(false)}
                        anchor={
                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setVisible(true)}
                            >
                                <Text>{dayType === 1 ? 'Full Day' : 'Half Day'}</Text>
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item
                            onPress={() => {
                                setDayType(1);
                                setVisible(false);
                            }}
                            title="Full Day"
                        />
                        <Menu.Item
                            onPress={() => {
                                setDayType(2);
                                setVisible(false);
                            }}
                            title="Half Day"
                        />
                    </Menu>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description"
                        multiline
                        numberOfLines={4}
                        onChangeText={(text) => setDescription(text)}
                        value={description}
                    />
                </ScrollView>
                <ModalAlert modalVisible={modalVisible} setModalVisible={setModalVisible} modalMessage={modalMessage} callback={modalCb} hideBtn={false} ></ModalAlert>
                <View style={styles.footer}>
                    {displayBtn()}
                    <Banner message={bannerMsg} isVisible={bannerVisible} />
                </View>
            </View>
        </Provider>

    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
        backgroundColor: "#f2f4f5"

    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        justifyContent: 'center',
        marginVertical: 10
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    }
});

export default EventForm;
