import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import React from "react";
import Login from "./Pages/login_test.jsx";
import store from "../store/store.js";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import SignUp from "./Pages/Signup.jsx";
import Register from "./Pages/fire_regis.jsx";
import YogaWebpage from "./Pages/YogaPoses.jsx";
//import Login from "./Pages/Login.jsx";
import Manager from "./Pages/test_manager.jsx";
//import Manager from "./Pages/Manager.jsx";
import PatientData from "./Pages/PatientData.jsx";
import AllPatientData from "./Pages/PatientFetch.jsx";
import FoodMenu from "./Pages/foodChart.jsx";
import NewPatient from "./Pages/createNewPatient.jsx";
import CreateFoodChart from "./Pages/CreateFoodChart.jsx";
import CreatePantryStaff from "./Pages/CreatePantryPersonal.jsx";
import FetchStaffData from "./FetchPantryStaff.jsx";
import DeliverMeals from "./Pages/DeliverMeals.jsx";
import FrontPage from "./Pages/StartPage.jsx";
import Pantry from "./Pages/Pantry.jsx";
import DoctorPage from "./Pages/DoctorsPage.jsx";
import CreateDoctor from "./Pages/CreateDoctor.jsx";
import YogaPose from "./Pages/YogaForOrgans.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/home",
        element: <App />,
      },

    ],
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/alldoctor",
    element: <DoctorPage />,
  },
  {
    path: "/manager",
    element: <Manager />,
  },
  {
    path: "/yogawebpage",
    element: <YogaWebpage />,
  },
  {
    path: "/createdoctor",
    element: <CreateDoctor />,
  },
  {
    path: "/yoga",
    element: <YogaPose />,
  },
  {
    path: "/patient",
    element: <PatientData />,
  },
  {
    path: "/allpatient",
    element: <AllPatientData />,
  },
  {
    path: "/menu",
    element: <FoodMenu />,
  },

  {
    path: "/newpatient",
    element: <NewPatient />,
  },
  {
    path: "/createfoodchart",
    element: <CreateFoodChart />,
  },
  {
    path: "/createpantry",
    element: <CreatePantryStaff />,
  },
  {
    path: "/fetchpantry",
    element: <FetchStaffData />,
  },
  {
    path: "/delivermeals",
    element: <DeliverMeals />,
  },
  {
    path: "/pantry",
    element: <Pantry />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>
  </StrictMode>
);
