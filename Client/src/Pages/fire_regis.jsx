// src/components/Register.js
import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
//import { sendCustomVerificationEmail } from './utils/sendCodeEmail'; // you'll implement this
import { v4 as uuidv4 } from 'uuid';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Generate 6-digit verification code or UUID
      const code = Math.floor(100000 + Math.random() * 900000); // e.g., 6-digit code

      // Store it to backend (Firestore or custom API)
      // And send email using EmailJS, SendGrid etc.
      await sendCustomVerificationEmail(email, code);

      setMessage('✅ Verification code sent to your email. Please check your inbox.');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('❌ This email is already in use. Please try a different email.');
      } else {
        setMessage(`❌ ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>
        </form>
        {message && <p className="text-sm text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
