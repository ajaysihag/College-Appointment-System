import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentDashboard = ({ userId }) => {
    const [appointments, setAppointments] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [selectedProfessor, setSelectedProfessor] = useState("");
    const [availabilities, setAvailabilities] = useState([]);

    const formatDateTime = (dateTime) => {
        console.log("Formatting dateTime:", dateTime); // Debug log
        if (!dateTime) return "";
        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTime));
    };


    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/appointments/${userId}`);
            console.log("Appointments response:", response.data);
            // const enrichedAppointments = await Promise.all(
            //     response.data.map(async (appointment) => {
            //         console.log("Processing appointment:", appointment); // Debug log
            //         try {
            //             const professorResponse = await axios.get(
            //                 `http://localhost:8000/professors/${appointment.professorId}`
            //             );
            //             return {
            //                 ...appointment,
            //                 professorName: professorResponse.data.username,
            //             };
            //         } catch {
            //             return {
            //                 ...appointment,
            //                 professorName: "Unknown Professor",
            //             };
            //         }
            //     })
            // );
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error.response?.data || error.message);
        }
    };


    const fetchProfessors = async () => {
        try {
            const response = await axios.get("http://localhost:8000/professors");
            setProfessors(response.data);
        } catch (error) {
            console.error("Error fetching professors:", error.response?.data || error.message);
        }
    };

    const fetchAvailabilities = async (professorId) => {
        try {
            const response = await axios.get(`http://localhost:8000/availability/${professorId}`);
            console.log("available.......", response.data);
            setAvailabilities(response.data);
        } catch (error) {
            console.error("Error fetching availabilities:", error.response?.data || error.message);
        }
    };

    const bookAppointment = async (professorId, timeSlot) => {
        const payload = {
            studentId: userId,
            professorId,
            timeSlot,
        };

        try {
            await axios.post("http://localhost:8000/appointments", payload);
            alert("Appointment booked successfully!");
            fetchAppointments(); // Refresh the appointments list
        } catch (error) {
            if (error.response?.data?.error) {
                alert(error.response.data.error); // Show the error message from the backend
            } else {
                console.error("Error booking appointment:", error.message);
            }
        }
    };


    useEffect(() => {
        if (userId) {
            fetchAppointments();
            fetchProfessors();
        }
    }, [userId]);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Student Dashboard</h2>

            <div className="mb-5">
                <h3>Your Appointments</h3>
                <ul className="list-group">
                    {appointments.map((appointment) => (
                        <li key={appointment.appointmentId} className="list-group-item">
                            Your appointment is booked at <b>{formatDateTime(appointment.timeSlot)}</b>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-5">
                <h3>Available Professors</h3>
                <select
                    className="form-select"
                    value={selectedProfessor}
                    onChange={(e) => {
                        setSelectedProfessor(e.target.value);
                        fetchAvailabilities(e.target.value);
                    }}
                >
                    <option value="">-- Select a Professor --</option>
                    {professors.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                            {professor.username}
                        </option>
                    ))}
                </select>
            </div>

            {selectedProfessor && (
                <div className="mb-5">
                    <h3>Available Slots for Selected Professor</h3>
                    <ul className="list-group">
                        {availabilities.map((slot) => (
                            <li
                                key={slot.meetingTime}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>{formatDateTime(slot.meetingTime)}</span>
                                {slot.isBooked ? (
                                    <button
                                        className="btn btn-success btn-sm"
                                        disabled
                                    >
                                        Already Booked
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => bookAppointment(selectedProfessor, slot.meetingTime)}
                                    >
                                        Book Appointment
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

            )}
        </div>
    );
};

export default StudentDashboard;
