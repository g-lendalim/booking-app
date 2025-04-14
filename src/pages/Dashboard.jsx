import React, { useContext, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from '../components/AuthProvider';
import {
  fetchAvailableSlots,
  fetchAppointments,
  addAppointment,
} from "../features/appointments/appointmentSlice";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import NewAppointmentModal from "../components/NewAppointmentModal";
import moment from "moment";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const { loading, error, availableSlots, appointments } = useSelector((state) => state.appointments);

  const [modalShow, setModalShow] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const userId = currentUser?.uid;
  const role = currentUser?.role;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        await dispatch(fetchAvailableSlots());
        await dispatch(fetchAppointments());
      } catch (err) {
        console.error("Error fetching slots/appointments:", err);
      }
    };

    fetchData();
  }, [dispatch, userId]);

  const normalizeTime = (date) => {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  };

  const splitSlotIntoHalfHours = (slot, doctorName, doctorUid) => {
    const intervals = [];
    let current = moment(slot.start);
    const endTime = moment(slot.end);

    while (current < endTime) {
      const next = moment.min(moment(current).add(30, "minutes"), endTime);
      intervals.push({
        id: `slot-${doctorUid}-${current.format("YYYYMMDD-HHmm")}`,
        title: doctorName,
        start: current.toDate(),
        end: next.toDate(),
        color: "#28a745",
        extendedProps: {
          isAvailableSlot: true,
          doctorUid,
          status: "available",
        },
      });
      current = next;
    }

    return intervals;
  };

  const slotEventsFiltered = useMemo(() => {
    if (!availableSlots?.length) return [];

    const rawSlots = availableSlots.flatMap(doc =>
      doc.slots.flatMap(slot =>
        splitSlotIntoHalfHours(
          { start: new Date(slot.start), end: new Date(slot.end) },
          slot.doctorName,
          doc.id
        )
      )
    );

    return rawSlots.filter((slot) => {
      const slotStart = normalizeTime(slot.start);
      const slotEnd = normalizeTime(slot.end);
      const doctorUid = slot.extendedProps.doctorUid;

      const isOverlapping = appointments.some(app => {
        const appStart = normalizeTime(app.start);
        const appEnd = normalizeTime(app.end);
        return (
          app.doctorUid === doctorUid &&
          slotStart < appEnd &&
          slotEnd > appStart
        );
      });

      return !isOverlapping;
    });
  }, [availableSlots, appointments]);

  const events = useMemo(() => {
    const appointmentEvents = appointments.map((appt) => ({
      id: appt.id,
      title: appt.doctorName || "Appointment",
      start: new Date(appt.start),
      end: new Date(appt.end),
      color: "#808080",
      extendedProps: {
        ...appt,
        isAvailableSlot: false,
        patientName: appt.patientName || "Patient",
      },
    }));

    return [...slotEventsFiltered, ...appointmentEvents];
  }, [appointments, slotEventsFiltered]);

  const handleEventClick = ({ event }) => {
    const { isAvailableSlot, doctorUid } = event.extendedProps;

    if (isAvailableSlot) {
      setSelectedSlot({
        id: event.id,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        doctorName: event.title,
        doctorUid,
        patientUid: userId,
      });
      setAppointment(null);
      setModalShow(true);
    }
  };

  const handleModalConfirm = async (appointmentDetails) => {
    if (!appointmentDetails.start || !appointmentDetails.end) {
      console.error("Start time or End time is missing.");
      return;
    }

    try {
      await dispatch(addAppointment(appointmentDetails));
      setModalShow(false);
      await dispatch(fetchAppointments());
      await dispatch(fetchAvailableSlots());
    } catch (error) {
      console.error("Failed to add appointment:", error);
    }
  };

  const handleDateAndTimeSelect = (selection) => {
    setSelectedSlot({
      start: selection.startStr,
      end: selection.endStr,
    });
    setAppointment(null);
    setModalShow(true);
  };

  if (!currentUser || loading) {
    return <div className="text-center text-white py-5">Loading...</div>;
  }

  return (
    <div className="dashboard-container min-vh-100 bg-light">
      <div className="header-section py-4 bg-white shadow-sm">
        <div className="container-fluid px-5">
          <h1 className="display-6 mb-2 fw-bold">Dashboard</h1>
        </div>
      </div>

      <div className="content-section py-4">
        <div className="container-fluid px-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="alert alert-info border-0 rounded-4 bg-white shadow-sm mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <p className="mb-0">
                    To book an appointment, click on a <span className="badge bg-success">green</span> time slot below
                  </p>
                </div>
              </div>

              {error && <div className="alert alert-danger border-0 rounded-4 shadow-sm">{error}</div>}

              <div className="card border-0 rounded-4 shadow">
                <div className="card-body p-4" style={{ overflowY: "auto" }}>
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={events}
                    selectable
                    editable={role === "doctor" || role === "admin"}
                    eventClick={handleEventClick}
                    select={role !== "patient" ? handleDateAndTimeSelect : null}
                    height="auto"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    dayHeaderFormat={{ weekday: 'long', day: 'numeric' }}
                    dayCellClassNames={(arg) => {
                      const today = moment().format("YYYY-MM-DD");
                      return arg.dateStr === today ? ["current-day-highlight"] : [];
                    }}
                    eventContent={({ event }) => {
                      const { patientName, isAvailableSlot } = event.extendedProps;
                      const start = moment(event.start).format("h:mm A");
                      const end = moment(event.end).format("h:mm A");

                      return (
                        <div style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
                          <div className="d-flex flex-column text-center">
                            <strong>{event.title}</strong>
                            <span style={{ fontSize: "0.75rem" }}>{start} - {end}</span>
                            <span className={`badge ${isAvailableSlot ? 'bg-success' : 'bg-secondary'} mt-1`}>
                              {isAvailableSlot ? 'Available' : `Booked${patientName ? ` - ${patientName}` : ''}`}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                    slotLabelFormat={{
                      hour: 'numeric',
                      minute: '2-digit',
                      meridiem: 'short',
                    }}
                    eventClassNames={({ event }) =>
                      event.extendedProps.isAvailableSlot ? ['available-slot', 'cursor-pointer'] : []
                    }
                  />
                </div>
              </div>

              <NewAppointmentModal
                show={modalShow}
                handleClose={() => setModalShow(false)}
                appointment={appointment || { start: "", end: "", doctorName: "" }}
                selectedSlot={selectedSlot || { start: "", end: "" }}
                onConfirm={handleModalConfirm}
                currentUser={currentUser}
                availableSlots={slotEventsFiltered}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
