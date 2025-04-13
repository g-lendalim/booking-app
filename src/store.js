import { configureStore } from "@reduxjs/toolkit";
import appointmentReducer from "./features/appointments/appointmentSlice";

export default configureStore({
  reducer: {
    appointments: appointmentReducer,
  },
});
