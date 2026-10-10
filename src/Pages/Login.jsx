import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";
import { Button, Input } from "../components/ui";
import AuthShell from "./AuthShell";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const res = await login(values);
      toast.success(res.message);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setServerError(errorMessage(err, "Sign-in failed"));
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
      <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your work email to continue.</p>

      {serverError && (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@hospital.org"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
          })}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-[30px] rounded-md p-1.5 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to MediCare?{" "}
        <Link to="/signup" className="font-medium text-brand-700 hover:text-brand-800">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
