import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, GuestOnly, FullPageLoader } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Patients = lazy(() => import("./Pages/Patients"));
const Doctors = lazy(() => import("./Pages/Doctors"));
const DietPlans = lazy(() => import("./Pages/DietPlans"));
const Deliveries = lazy(() => import("./Pages/Deliveries"));
const Staff = lazy(() => import("./Pages/Staff"));
const NotFound = lazy(() => import("./Pages/NotFound"));

// Paths used by v1 of the app, kept so old bookmarks still land somewhere sensible.
const LEGACY = {
  "/manager": "/dashboard",
  "/pantry": "/dashboard",
  "/allpatient": "/patients",
  "/createpatient": "/patients",
  "/alldoctors": "/doctors",
  "/createdoctor": "/doctors",
  "/menu": "/diet-plans",
  "/createfoodchart": "/diet-plans",
  "/deliverMeals": "/deliveries",
  "/createpantry": "/staff",
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<GuestOnly />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/diet-plans" element={<DietPlans />} />
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/staff" element={<Staff />} />
              </Route>
            </Route>

            {Object.entries(LEGACY).map(([from, to]) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer position="top-right" autoClose={3500} hideProgressBar newestOnTop theme="light" />
      </AuthProvider>
    </BrowserRouter>
  );
}
