import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase'; 
import { Timestamp, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';

const initialState = {
  appointments: [],
  availableSlots: [],
  loading: false,
  error: null, 
};

export const fetchAvailableSlots = createAsyncThunk(
  "appointments/fetchAvailableSlots",
  async (doctorUid = null, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(
        doctorUid
          ? query(collection(db, "availableSlots"), where("doctorUid", "==", doctorUid))
          : collection(db, "availableSlots")
      );

      const slotsByDoctor = {};

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const doctorUid = data.doctorUid;

        if (!slotsByDoctor[doctorUid]) {
          slotsByDoctor[doctorUid] = { id: doctorUid, slots: [] };
        }

        data.slots.forEach(slot => {
          slotsByDoctor[doctorUid].slots.push({
            ...slot,
            start: slot.start.toMillis(),
            end: slot.end.toMillis(),
          });
        });
      });
      return Object.values(slotsByDoctor);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      return rejectWithValue(error.message || 'Unknown error occurred');
    }
  }
);

export const addAppointment = createAsyncThunk(
  'appointments/addAppointment',
  async (appointmentDetails, { dispatch, rejectWithValue }) => {
    try {
      console.log('Received Appointment Details:', appointmentDetails);

      const { start, end } = appointmentDetails;
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid Date:", start, end);
        return rejectWithValue('Invalid appointment start or end date.');
      }

      console.log('Valid Start Date:', startDate);
      console.log('Valid End Date:', endDate);

      // Convert start and end dates to timestamps
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentDetails,
        status: 'Scheduled',
        start: Timestamp.fromMillis(startTimestamp), // Save as timestamp
        end: Timestamp.fromMillis(endTimestamp), // Save as timestamp
      });

      const newAppointment = { ...appointmentDetails, id: docRef.id, start: startTimestamp, end: endTimestamp };

      dispatch(fetchAppointments());  
      return newAppointment; 
    } catch (error) {
      console.error('Error adding appointment:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => { 
    try {
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const appointments = [];
      querySnapshot.forEach((doc) => {
        const appointmentData = doc.data();
        const startTimestamp = appointmentData.start instanceof Timestamp ? appointmentData.start.toMillis() : appointmentData.start;
        const endTimestamp = appointmentData.end instanceof Timestamp ? appointmentData.end.toMillis() : appointmentData.end;

        appointments.push({
          ...appointmentData,
          id: doc.id,
          start: startTimestamp,
          end: endTimestamp,
        });
      });

      return appointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const docRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(docRef);
      return appointmentId; 
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async (updatedAppointment, { rejectWithValue }) => {
    try {
      const docRef = doc(db, 'appointments', updatedAppointment.id);
      await updateDoc(docRef, {
        ...updatedAppointment,
        start: updatedAppointment.start instanceof Timestamp ? updatedAppointment.start : Timestamp.fromDate(new Date(updatedAppointment.start)),
        end: updatedAppointment.end instanceof Timestamp ? updatedAppointment.end : Timestamp.fromDate(new Date(updatedAppointment.end)),
      });
      return updatedAppointment; 
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.message); 
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    setAvailableSlots: (state, action) => {
      state.availableSlots = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload; 
        console.log("Available Slots in Redux:", action.payload); 
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        console.log("Appointments received:", action.payload);
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Error fetching appointments:", action.payload);  
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        const appointment = action.payload;

        if (appointment.start instanceof Timestamp) {
          appointment.start = appointment.start.toDate().getTime();  
        }

        if (appointment.end instanceof Timestamp) {
          appointment.end = appointment.end.toDate().getTime();  // Convert to milliseconds for consistency
        }

        state.appointments.push(appointment);
      })

      .addCase(addAppointment.rejected, (state, action) => {
        state.error = action.payload; 
      })

      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (appointment) => appointment.id !== action.payload
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.error = action.payload; 
      })

      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.error = action.payload; 
      });
  },
});

export const { setAppointments, setAvailableSlots, setLoading, setError } = appointmentSlice.actions;

export default appointmentSlice.reducer;
