import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function DeleteAppointmentModal({
  show,
  handleClose,
  appointmentId,
  onDelete
}) {
  const handleDelete = () => {
    onDelete(appointmentId);
    handleClose(); 
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this appointment? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete Appointment
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
