import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Manager from "./Pages/Manager";
import Pantry from "./Pages/Pantry";
import PatientFetch from "./Pages/PatientFetch";
import DoctorsPage from "./Pages/DoctorsPage";
import FoodChart from "./Pages/FoodChart";
import DeliverMeals from "./Pages/DeliverMeals";
import CreateNewPatient from "./Pages/CreateNewPatient";
import CreateDoctor from "./Pages/CreateDoctor";
import CreateFoodChart from "./Pages/CreateFoodChart";
import CreatePantryPersonal from "./Pages/CreatePantryPersonal";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/allpatient" element={<PatientFetch />} />
        <Route path="/alldoctors" element={<DoctorsPage />} />
        <Route path="/menu" element={<FoodChart />} />
        <Route path="/deliverMeals" element={<DeliverMeals />} />
        <Route path="/createpatient" element={<CreateNewPatient />} />
        <Route path="/createdoctor" element={<CreateDoctor />} />
        <Route path="/createfoodchart" element={<CreateFoodChart />} />
        <Route path="/createpantry" element={<CreatePantryPersonal />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
