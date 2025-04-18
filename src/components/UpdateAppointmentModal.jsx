import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; 

export default function UpdateAppointmentModal({
  show,
  handleClose,
  onConfirm,
  currentUser,
  selectedAppointment,
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
    if (selectedAppointment) {
      setTitle(selectedAppointment.title || "");
      setStartTime(moment(selectedAppointment.start).format("YYYY-MM-DDTHH:mm"));
      setEndTime(moment(selectedAppointment.end).format("YYYY-MM-DDTHH:mm"));
      setNotes(selectedAppointment.notes || "");
      setStatus(selectedAppointment.status || "Scheduled");
      setPatientName(selectedAppointment.patientName || "");
      setDoctorName(selectedAppointment.doctorName || "");
      setPatientUid(selectedAppointment.patientUid || "");
    }
  }, [selectedAppointment]);

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

  const handleConfirm = () => {
    if (!startTime || !endTime) {
      console.error("Start or end time missing.");
      return;
    }

    const updatedAppointment = {
      title,
      patientName,
      doctorName,
      start: new Date(startTime).getTime(),
      end: new Date(endTime).getTime(),
      notes,
      status,
      doctorUid: selectedAppointment.doctorUid,
      patientUid: currentUser.role === "patient" ? currentUser.uid : patientUid,
      availableSlotId: selectedAppointment.availableSlotId,
      id: selectedAppointment.id,
    };

    onConfirm(updatedAppointment);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Appointment</Modal.Title>
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
            <Form.Control type="text" value={doctorName} disabled />
          </Form.Group>

          <Form.Group>
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startTime}
              disabled
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={endTime}
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
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
