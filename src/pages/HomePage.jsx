import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableSlots,
  fetchAppointments,
  deleteAppointment,
  updateAppointment,
} from "../features/appointments/appointmentSlice";
import { AuthContext } from "../components/AuthProvider";
import { Button, Table, Badge, Tabs, Tab } from "react-bootstrap";
import UpdateAppointmentModal from "../components/UpdateAppointmentModal";
import DeleteAppointmentModal from "../components/DeleteAppointmentModal";

export default function Homepage() {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const [modalType, setModalType] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { appointments = [], error, loading, availableSlots } = useSelector(
    (state) => state.appointments
  );

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchAppointments({ userId: currentUser.uid, role: currentUser.role }));
      dispatch(fetchAvailableSlots());
    }
  }, [dispatch, currentUser]);

  const handleDelete = (appointmentId) => {
    dispatch(deleteAppointment(appointmentId));
    setModalType(null);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setModalType("update");
  };

  const handleUpdateAppointment = (updatedAppointment) => {
    dispatch(updateAppointment(updatedAppointment));
    setModalType(null);
  };

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleDateString("en-GB", { dateStyle: "medium" });

  const formatTimeRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateStr = formatDate(start);
    const timeStr = `${startDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${endDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    return `${dateStr}\n${timeStr}`;
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge bg="success">Confirmed</Badge>;
      case "scheduled":
        return <Badge bg="warning" text="dark">Scheduled</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">N/A</Badge>;
    }
  };

  const isUpcoming = (appointment) => appointment.start > Date.now();

  const filteredAppointments = appointments.filter((appointment) => {
    const matchDate =
      activeTab === "upcoming" ? isUpcoming(appointment) : !isUpcoming(appointment);
  
    if (currentUser.role === "admin") {
      return matchDate;
    }
  
    const matchUser =
      appointment.patientUid?.trim() === currentUser.uid ||
      appointment.doctorUid?.trim() === currentUser.uid;
  
    return matchUser && matchDate;
  });  

  return (
    <div className="mt-5 container">
      {loading && <div className="text-center">Loading appointments...</div>}
      {error && <div className="text-danger text-center">Error: {error}</div>}

      <div className="text-center mb-4">
        <h2 className="fw-bold">Appointments</h2>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        className="mb-4 custom-tabs"
        justify
      >
        <Tab eventKey="upcoming" title="Upcoming Appointments" />
        <Tab eventKey="past" title="Past Appointments" />
      </Tabs>

      {(currentUser.role === "admin" || currentUser.role === "doctor") && (
        <div className="table-responsive">
          <Table striped bordered hover responsive className="text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.title || "Untitled"}</td>
                    <td>{appointment.doctorName || "Unknown"}</td>
                    <td>{appointment.patientName || "Unknown"}</td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {formatTimeRange(appointment.start, appointment.end)}
                    </td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>{appointment.notes || "No notes"}</td>
                    <td>
                      <Button
                        variant="warning"
                        className="me-2 text-dark"
                        onClick={() => handleEdit(appointment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setModalType("delete");
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No appointments available.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {currentUser.role === "patient" && (
        <div className="row g-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div className="col-md-6 col-lg-4" key={appointment.id}>
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">
                          {appointment.title || "Untitled"}
                        </h5>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <h6 className="card-subtitle text-muted mb-3">
                        {appointment.doctorName || "Unknown Doctor"}
                      </h6>

                      <div className="mb-3">
                        <p className="mb-1"><strong>Date & Time:</strong></p>
                        <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                          {formatTimeRange(appointment.start, appointment.end)}
                        </p>
                        <p className="mb-1"><strong>Notes:</strong></p>
                        <p className="text-muted">
                          {appointment.notes || "No notes"}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between pt-2">
                      <Button
                        variant="warning"
                        className="text-dark w-50 me-2"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setModalType("update");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="w-50"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setModalType("delete");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">No appointments found.</div>
          )}
        </div>
      )}

      {/* Modals */}
      {modalType === "update" && selectedAppointment && (
        <UpdateAppointmentModal
          show={modalType === "update"}
          handleClose={() => setModalType(null)}
          selectedAppointment={selectedAppointment}
          onConfirm={handleUpdateAppointment}
          currentUser={currentUser}
          availableSlots={availableSlots}
        />
      )}

      {modalType === "delete" && selectedAppointment && (
        <DeleteAppointmentModal
          show={modalType === "delete"}
          handleClose={() => setModalType(null)}
          appointmentId={selectedAppointment.id}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
