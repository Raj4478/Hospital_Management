import {configureStore} from  "@reduxjs/toolkit"
import patientObjectId from "./detailProvider.js"


const store = configureStore({
    reducer:{
        data:patientObjectId,
    }
})

export default store