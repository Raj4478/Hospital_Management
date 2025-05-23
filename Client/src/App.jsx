import React from "react";
import { useState } from "react";
//import SignUp from "./Pages/Signup";
import Login from "./Pages/Login";
import FrontPage from "./Pages/StartPage";
import Register from "./Pages/fire_regis.jsx";
import SignUp from "./Pages/test_register.jsx";
import EmailVerification from "./Pages/testmail.jsx";
import Manager from "./Pages/test_manager.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Login />
    </>
  );
}

export default App;
