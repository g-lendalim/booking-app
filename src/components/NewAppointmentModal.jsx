import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; 

export default function NewAppointmentModal({
  show,
  handleClose,
  onConfirm,
  currentUser,
  availableSlots,
  selectedSlot,
}) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(""); 
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientUid, setPatientUid] = useState("");
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    if (selectedSlot) {
      setStartTime(moment(selectedSlot.start).format("YYYY-MM-DDTHH:mm"));
      setEndTime(moment(selectedSlot.end).format("YYYY-MM-DDTHH:mm"));
      setDoctorName(selectedSlot.doctorName);
  
      if (currentUser.role === "patient") {
        setPatientUid(currentUser.uid);
        setPatientName(currentUser.fullName || ""); 
      } else {
        setPatientUid("");
      }
    }
  }, [selectedSlot, currentUser]);

  useEffect(() => {
    const fetchAllPatients = async () => {
      if (currentUser.role === "doctor" || currentUser.role === "admin") {
        try {
          const q = query(collection(db, "users"), where("role", "==", "patient"));
          const querySnapshot = await getDocs(q);
          const patients = querySnapshot.docs.map(doc => ({
            id: doc.id,
            fullName: doc.data().fullName,
          }));
          setAllPatients(patients);
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      }
    };
  
    fetchAllPatients();
  }, [currentUser]);
  
  const handleConfirm = async () => {
    try {
      if (!startTime || !endTime) {
        console.error("Start time or End time is missing.");
        return;
      }

      const newAppointment = {
        title,
        patientName,
        doctorName,
        start: new Date(startTime).getTime(), // Convert start time to timestamp
        end: new Date(endTime).getTime(),     // Convert end time to timestamp
        notes,
        status,
        doctorUid: selectedSlot.doctorUid,
        patientUid: currentUser.role === "patient" ? currentUser.uid : patientUid,
        availableSlotId: selectedSlot.id,
      };
      onConfirm(newAppointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };  
  
  const handleDuration = (e) => {
    const start = e.target.value;
    setStartTime(start);
    const end = moment(start).add(30, "minutes").format("YYYY-MM-DDTHH:mm"); 
    setEndTime(end);
  };

  const availableSlotsFiltered = availableSlots.filter(
    (slot) => moment(slot.start).isAfter(moment())
  );  

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create A New Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Purpose of Visit</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Patient</Form.Label>
            {currentUser.role === "doctor" || currentUser.role === "admin" ? (
              <Form.Select
                value={patientUid}
                onChange={(e) => {
                  const selected = allPatients.find(p => p.id === e.target.value);
                  setPatientUid(selected.id);
                  setPatientName(selected.fullName);
                }}
              >
                <option value="">Select a patient</option>
                {allPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled
              />
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>Doctor</Form.Label>
            <Form.Control
              type="text"
              value={doctorName}
              disabled
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              as="select"
              value={startTime}
              onChange={handleDuration}
            >
              {availableSlotsFiltered.map((slot, index) => (
                <option key={index} value={moment(slot.start).format("YYYY-MM-DDTHH:mm")}>
                  {moment(slot.start).format("DD/MM/YYYY h:mm A")}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={currentUser.role === "patient"}
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
