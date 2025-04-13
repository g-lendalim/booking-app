import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from '../components/AuthProvider';
import {
  fetchAvailableSlots,
  fetchAppointments, 
  addAppointment
} from "../features/appointments/appointmentSlice";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import NewAppointmentModal from "../components/NewAppointmentModal";
import moment from "moment";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { loading, error, availableSlots, appointments } = useSelector((state) => state.appointments);
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser?.uid;
  const role = currentUser?.role;

  const [modalShow, setModalShow] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchAvailableSlots());
      dispatch(fetchAppointments());
    }
  }, [dispatch, currentUser]);

  const splitSlotIntoHalfHours = (slot, doctorName, doctorUid) => {
    const intervals = [];
    let current = moment(slot.start);
    const endTime = moment(slot.end);

    while (current < endTime) {
      const next = moment(current).add(30, "minutes");
      intervals.push({
        id: `slot-${doctorUid}-${current.format("HHmm")}`,
        title: `${doctorName}`,
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

  function normalizeTime(date) {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }  

  // Format appointment events correctly with precise time
  const appointmentEvents = appointments.map((appt) => {
    const start = moment(appt.start).toDate();
    const end = moment(appt.end).toDate();
    return {
      id: appt.id,
      title: appt.doctorName || "Appointment",
      start: start,
      end: end,
      color: "#808080", 
      extendedProps: {
        ...appt,
        isAvailableSlot: false,
        patientName: appt.patientName || "Patient",
      },
    };
  });

  const slotEvents = availableSlots.flatMap((doc) =>
    doc.slots.flatMap((slot) =>
      splitSlotIntoHalfHours(slot, slot.doctorName, doc.id)
    )
  );

  // Filter out slots that overlap with booked appointments
  const slotEventsFiltered = slotEvents.filter((slot) => {
    const slotStart = normalizeTime(slot.start);
    const slotEnd = normalizeTime(slot.end);
    const doctorUid = slot.extendedProps.doctorUid || slot.doctorUid;

    const isOverlapping = appointments.some((app) => {
      const appStart = normalizeTime(app.start);
      const appEnd = normalizeTime(app.end);

      return (
        app.doctorUid === doctorUid &&
        ((slotStart >= appStart && slotStart < appEnd) || 
         (slotEnd > appStart && slotEnd <= appEnd) ||
         (slotStart <= appStart && slotEnd >= appEnd))
      );
    });

    return !isOverlapping;
  });

  const events = [...slotEventsFiltered, ...appointmentEvents];

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

  const handleDateAndTimeSelect = (selection) => {
    setSelectedSlot({
      start: selection.startStr,
      end: selection.endStr,
    });
    setAppointment(null);
    setModalShow(true);
  };

  const handleModalConfirm = async (appointmentDetails) => {
    if (!appointmentDetails.start || !appointmentDetails.end) {
      console.error("Start time or End time is missing.");
      return;
    }

    try {
      await dispatch(addAppointment(appointmentDetails));
      setTimeout(() => {
        dispatch(fetchAppointments());
      }, 500);
      setModalShow(false);
    } catch (error) {
      console.error("Failed to add appointment:", error);
    }
  };

  return (
    <div className="bg-dark text-white py-5 min-vh-100">
      <div className="container-fluid px-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <p className="fs-4 text-center mb-4">
              To book an appointment, simply <strong>click on a</strong> <span className="text-success fw-bold">green</span> time slot below.
            </p>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="card bg-dark border-0 shadow-lg rounded-4">
                <div className="card-body p-4" style={{ overflowY: "auto" }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    initialDate={new Date()}
                    events={events}
                    selectable={true}
                    editable={role === "doctor" || role === "admin"}
                    eventClick={handleEventClick}
                    select={role !== "patient" ? handleDateAndTimeSelect : null}
                    height="auto"
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00:00"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}                
                    dayHeaderFormat={{ weekday: 'long', day: 'numeric' }}
                    dayHeaderClassNames="bg-dark text-white"
                    dayCellClassNames={(arg) => {
                      const today = moment().format("YYYY-MM-DD");
                      if (arg.dateStr === today) return ["current-day-highlight"];
                      return [];
                    }}
                    eventContent={(eventInfo) => {
                      const { patientName, isAvailableSlot } = eventInfo.event.extendedProps;
                      const isAvailable = isAvailableSlot;
                      const start = moment(eventInfo.event.start).format("h:mm A");
                      const end = moment(eventInfo.event.end).format("h:mm A");

                      return (
                        <div style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
                          <div className="d-flex flex-column text-center">
                            <strong>{eventInfo.event.title.split("\n")[0]}</strong>
                            <span style={{ fontSize: "0.75rem" }}>
                              {start} - {end}
                            </span>
                            <span className={`badge ${isAvailable ? 'bg-success' : 'bg-secondary'} mt-1`}>
                              {isAvailable ? 'Available' : `Booked${patientName ? ` - ${patientName}` : ''}`}
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
                    eventClassNames={(arg) => {
                      return arg.event.extendedProps.isAvailableSlot ? ['available-slot', 'cursor-pointer'] : [];
                    }}
                  />
                </div>
              </div>
            )}

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
  );
}