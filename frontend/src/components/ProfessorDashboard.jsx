import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfessorDashboard = ({ userId }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [meetingDate, setMeetingDate] = useState(""); // Separate state for date
  const [meetingTime, setMeetingTime] = useState(""); // Separate state for time

  const fetchAvailabilities = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/availability/${userId}`);
      setAvailabilities(response.data);
    } catch (error) {
      console.error("Error fetching availabilities:", error.response?.data || error.message);
    }
  };

  const addAvailability = async () => {
    if (!meetingDate || !meetingTime) {
      alert("Please select both meeting date and time");
      return;
    }

    const meetingDateTime = `${meetingDate}T${meetingTime}`; // Combine date and time

    try {
      await axios.post("http://localhost:8000/availability", {
        professorId: userId,
        meetingTime: meetingDateTime,
      });

      // Append the new availability to the existing list
      setAvailabilities((prev) => [
        ...prev,
        { meetingTime: meetingDateTime, professorId: userId },
      ]);

      setMeetingDate(""); // Reset inputs
      setMeetingTime("");
    } catch (error) {
      console.error("Error adding availability:", error.response?.data || error.message);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(dateTime));
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []); // Add dependency array to prevent infinite loop

  return (
    <div className="container col-md-6">
      <h2 className="text-center mb-4">Professor Dashboard</h2>

      <div className="card shadow">
        <div className="card-body">
          <h3>Add Availability</h3>
          <div className="mb-3">
            <label htmlFor="meetingDate" className="form-label">
              Select Date:
            </label>
            <input
              id="meetingDate"
              type="date"
              className="form-control"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="meetingTime" className="form-label">
              Select Time:
            </label>
            <input
              id="meetingTime"
              type="time"
              className="form-control"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-50 mt-3" onClick={addAvailability}>
            Add Availability
          </button>
        </div>
      </div>

      <div className="mt-5">
        <h3>Your Availabilities</h3>
        <ul className="list-group">
          {availabilities.map((slot, index) => (
            <li key={index} className="list-group-item">
              {formatDateTime(slot.meetingTime)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
