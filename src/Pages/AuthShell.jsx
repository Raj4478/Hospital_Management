import { Cross, ShieldCheck, Truck, Salad, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Users, title: "Patient records", text: "Admissions, beds, allergies and the doctor in charge." },
  { icon: Salad, title: "Diet plans", text: "Three meals a day per patient, with special instructions." },
  { icon: Truck, title: "Meal delivery tracking", text: "Pending → preparing → out for delivery → delivered." },
  { icon: ShieldCheck, title: "Role-based access", text: "Managers and the pantry team each see what they need." },
];

/** Split layout shared by the sign-in and sign-up pages. */
export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
            <Cross className="h-4 w-4" strokeWidth={3} />
          </div>
          <span className="text-lg font-semibold">MediCare HMS</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Run wards, kitchens and deliveries from one place.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-100/80">
            A single workspace for hospital managers and pantry teams to keep every patient fed on time and on plan.
          </p>
          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-brand-100" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="text-sm text-brand-100/70">{text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100/50">© {new Date().getFullYear()} MediCare HMS</p>
      </div>

      <div className="flex items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Cross className="h-4 w-4" strokeWidth={3} />
            </div>
            <span className="text-lg font-semibold text-slate-900">MediCare HMS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
