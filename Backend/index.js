const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();

// Middleware
require("dotenv").config();
app.use(cors());
app.use(bodyParser.json());

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});


// DynamoDB Table Names
const USER_TABLE = "Users";
const AVAILABILITY_TABLE = "Availabilities";
const APPOINTMENT_TABLE = "Appointments";

/**
 * Register a new user
 */
app.post("/register", async (req, res) => {
  const { username, password, isProfessor } = req.body;
  const userId = uuidv4();

  try {
    const params = {
      TableName: USER_TABLE,
      Item: {
        id: { S: userId },
        username: { S: username },
        password: { S: password },
        isProfessor: { BOOL: isProfessor },
      },
    };

    await client.send(new PutItemCommand(params));
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

/**
 * Login endpoint
 */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const params = {
      TableName: USER_TABLE,
      Key: {
        username: { S: username },
      },
    };

    const result = await client.send(new GetItemCommand(params));

    if (!result.Item || result.Item.password.S !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({
      username: result.Item.username.S,
      id: result.Item.id.S,
      role: result.Item.isProfessor.BOOL ? "professor" : "student",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

/**
 * Set availability for professors
 */
app.post("/availability", async (req, res) => {
  const { professorId, meetingTime } = req.body;
  const meetingId = uuidv4();

  try {
    const params = {
      TableName: AVAILABILITY_TABLE,
      Item: {
        meetingId: { S: meetingId },
        professorId: { S: professorId },
        meetingTime: { S: meetingTime },
      },
    };

    await client.send(new PutItemCommand(params));
    res.status(201).json({ message: "Availability added successfully" });
  } catch (error) {
    console.error("Add availability error:", error);
    res.status(500).json({ error: "Failed to add availability" });
  }
});

/**
 * Get availability for a professor
 */
app.get("/availability/:professorId", async (req, res) => {
  const { professorId } = req.params;

  try {
    const availabilityParams = {
      TableName: AVAILABILITY_TABLE,
      FilterExpression: "professorId = :professorId",
      ExpressionAttributeValues: {
        ":professorId": { S: professorId },
      },
    };

    const availabilityResult = await client.send(new ScanCommand(availabilityParams));
    const availabilityItems = availabilityResult.Items.map((item) => unmarshall(item));
    // Check if each slot is booked
    const enrichedAvailability = await Promise.all(
      availabilityItems.map(async (availability) => {
        const appointmentParams = {
          TableName: APPOINTMENT_TABLE,
          FilterExpression: "professorId = :professorId AND timeSlot = :timeSlot",
          ExpressionAttributeValues: {
            ":professorId": { S: professorId },
            ":timeSlot": { S: availability.meetingTime },
          },
        };

        const appointmentResult = await client.send(new ScanCommand(appointmentParams));
        const isBooked = appointmentResult.Count > 0; // If Count > 0, slot is booked

        return {
          ...availability,
          isBooked, // Add the `isBooked` status to the response
        };
      })
    );
    res.json(enrichedAvailability);
    // res.json(items);
  } catch (error) {
    console.error("Fetch availability error:", error);
    res.status(500).json({ error: "Failed to fetch availabilities" });
  }
});

/**
 * Book an appointment
 */
app.post("/appointments", async (req, res) => {
  const { studentId, professorId, timeSlot } = req.body;

  try {
    const queryParams = {
      TableName: APPOINTMENT_TABLE,
      FilterExpression: "professorId = :professorId AND timeSlot = :timeSlot",
      ExpressionAttributeValues: {
        ":professorId": { S: professorId },
        ":timeSlot": { S: timeSlot },
      },
    };

    const result = await client.send(new ScanCommand(queryParams));

    if (result.Count > 0) {
      return res.status(400).json({ error: "The appointment is already booked." });
    }

    const appointmentId = uuidv4();
    const insertParams = {
      TableName: APPOINTMENT_TABLE,
      Item: {
        appointmentId: { S: appointmentId },
        studentId: { S: studentId },
        professorId: { S: professorId },
        timeSlot: { S: timeSlot },
      },
    };

    await client.send(new PutItemCommand(insertParams));
    res.status(201).json({ message: "Appointment booked successfully." });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

/**
 * Fetch appointments for a user
 */
app.get("/appointments/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const params = {
      TableName: APPOINTMENT_TABLE,
      FilterExpression: "studentId = :studentId",
      ExpressionAttributeValues: { ":studentId": { S: userId } },
    };

    const result = await client.send(new ScanCommand(params));
    const appointments = result.Items.map((item) => unmarshall(item));
    res.json(appointments);
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 * Fetch all professors
 */
app.get("/professors", async (req, res) => {
  try {
    const params = {
      TableName: USER_TABLE,
      FilterExpression: "isProfessor = :isProfessor",
      ExpressionAttributeValues: {
        ":isProfessor": { BOOL: true },
      },
    };

    const result = await client.send(new ScanCommand(params));
    const professors = result.Items.map((item) => unmarshall(item));
    res.json(professors);
  } catch (error) {
    console.error("Fetch professors error:", error);
    res.status(500).json({ error: "Failed to fetch professors" });
  }
});

/**
 * Fetch a specific professor's details
 */
app.get("/professors/:professorId", async (req, res) => {
  const { professorId } = req.params;

  try {
    const params = {
      TableName: USER_TABLE,
      Key: {
        id: { S: professorId },
      },
    };

    const result = await client.send(new GetItemCommand(params));

    if (result.Item) {
      const professor = unmarshall(result.Item);

      if (professor.isProfessor) {
        res.json({ username: professor.username });
      } else {
        res.status(404).json({ error: "User is not a professor" });
      }
    } else {
      res.status(404).json({ error: "Professor not found" });
    }
  } catch (error) {
    console.error("Fetch professor details error:", error);
    res.status(500).json({ error: "Failed to fetch professor details" });
  }
});

/**
 * Default route
 */
app.get("/", (req, res) => {
  res.send("Welcome to the College Appointment System Backend!");
});

// Start server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
