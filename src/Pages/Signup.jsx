import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, errorMessage, toFormData } from "../lib/api";
import { Button, Input, cx } from "../components/ui";
import AuthShell from "./AuthShell";

const ROLE_INFO = {
  Manager: "Admit patients, manage doctors and diet plans.",
  Pantry: "Prepare meals and run deliveries to the wards.",
};

export default function Signup() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(["Manager", "Pantry"]);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: "Manager" },
  });
  const role = watch("role");

  useEffect(() => {
    api.get("/auth/signup-options")
      .then((res) => {
        const allowed = res.data.data.roles;
        setRoles(allowed);
        if (!allowed.includes(role)) setValue("role", allowed[0]);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await api.post("/auth/register", toFormData(values));
      toast.success("Account created. Sign in to continue.");
      navigate("/login");
    } catch (err) {
      setServerError(errorMessage(err, "Couldn't create your account"));
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h2>
      <p className="mt-1 text-sm text-slate-500">Set up access for your role in the hospital.</p>

      {serverError && (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">I work as</legend>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <label
                key={r}
                className={cx(
                  "cursor-pointer rounded-lg border p-3 transition-colors",
                  role === r ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <input type="radio" value={r} className="sr-only" {...register("role")} />
                <div className="text-sm font-medium text-slate-900">{r === "Pantry" ? "Pantry team" : r}</div>
                <div className="mt-0.5 text-xs text-slate-500">{ROLE_INFO[r]}</div>
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName", { required: "Full name is required" })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            autoComplete="username"
            error={errors.username?.message}
            {...register("username", {
              required: "Username is required",
              pattern: { value: /^[a-zA-Z0-9_.]{3,30}$/, message: "3–30 letters, numbers, . or _" },
            })}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
        </div>
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "At least 8 characters" },
            validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || "Include a letter and a number",
          })}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
