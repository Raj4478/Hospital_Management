import { createSlice } from "@reduxjs/toolkit";


const initialState = {

    objectid : null
}


const patientObjectId = createSlice({
    name : "data",
    initialState,
    reducers: {
  Objectid : (state,action) => {
    
    state.objectid = action.payload.objectid;
  },
  
    }
})

export const {Objectid} = patientObjectId.actions;

export default patientObjectId.reducer;