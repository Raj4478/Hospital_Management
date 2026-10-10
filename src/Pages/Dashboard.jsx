import { Link } from "react-router-dom";
import {
  Users, Stethoscope, Salad, ChefHat, ArrowRight, RefreshCw, AlertTriangle, Truck, CheckCircle2, Clock, Flame, XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useApi";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton, cx } from "../components/ui";
import { DELIVERY_STATUS, greeting, timeAgo, titleCase } from "../lib/format";

function StatCard({ icon: Icon, label, value, sub, to, accent }) {
  return (
    <Link to={to} className="group">
      <Card className="h-full p-4 transition-shadow group-hover:shadow-pop sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 sm:text-sm">{label}</span>
          <span className={cx("hidden h-9 w-9 items-center sm:flex justify-center rounded-lg", accent)}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
        <div className="mt-1 text-xs text-slate-500">{sub}</div>
      </Card>
    </Link>
  );
}

const PIPELINE = [
  { key: "pending", icon: Clock, color: "bg-slate-400" },
  { key: "preparing", icon: Flame, color: "bg-amber-500" },
  { key: "out_for_delivery", icon: Truck, color: "bg-blue-500" },
  { key: "delivered", icon: CheckCircle2, color: "bg-emerald-500" },
  { key: "cancelled", icon: XCircle, color: "bg-red-400" },
];

function DeliveryPipeline({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <Card>
      <CardHeader
        title="Today's meal deliveries"
        description={total ? `${counts.delivered} of ${total - counts.cancelled} delivered` : "Nothing scheduled yet"}
        action={<Link to="/deliveries" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">Open board <ArrowRight className="h-4 w-4" /></Link>}
      />
      <div className="p-5">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          {PIPELINE.map(({ key, color }) =>
            counts[key] ? <div key={key} className={color} style={{ width: `${(counts[key] / total) * 100}%` }} /> : null
          )}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PIPELINE.map(({ key, icon: Icon, color }) => (
            <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={cx("h-2 w-2 rounded-full", color)} />
                {DELIVERY_STATUS[key].label}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xl font-semibold text-slate-900">{counts[key]}</span>
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function WeeklyChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.delivered));
  const total = data.reduce((a, d) => a + d.delivered, 0);
  return (
    <Card>
      <CardHeader title="Meals delivered" description={`${total} in the last 7 days`} />
      <div className="flex h-48 items-end gap-3 px-5 pb-4 pt-6">
        {data.map((d, i) => {
          const day = new Date(`${d.date}T00:00:00`);
          const isToday = i === data.length - 1;
          return (
            <div key={d.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">{d.delivered}</span>
              <div
                className={cx("w-full max-w-10 rounded-t-md transition-colors", isToday ? "bg-brand-600" : "bg-brand-200 group-hover:bg-brand-300")}
                style={{ height: `${Math.max(4, (d.delivered / max) * 100)}%` }}
                title={`${d.delivered} delivered`}
              />
              <span className={cx("text-xs", isToday ? "font-semibold text-slate-900" : "text-slate-500")}>
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RecentActivity({ items }) {
  return (
    <Card>
      <CardHeader title="Recent activity" />
      {items.length === 0 ? (
        <EmptyState icon={Truck} title="No delivery activity yet" description="Assigned and completed deliveries will show up here." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((a) => (
            <li key={`${a.id}-${a.status}`} className="flex items-center gap-3 px-5 py-3">
              <Badge tone={DELIVERY_STATUS[a.status].tone} dot>{DELIVERY_STATUS[a.status].label}</Badge>
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium text-slate-900">{titleCase(a.patient || "Unknown patient")}</span>
                <span className="text-slate-500"> · {titleCase(a.mealSlot)} meal{a.room ? ` · Room ${a.room}` : ""}{a.staff ? ` · ${titleCase(a.staff)}` : ""}</span>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Attention({ missing, staff }) {
  const issues = [];
  if (missing.length) issues.push(...missing.map((p) => ({ key: p._id, text: `${titleCase(p.patientName)} (Room ${p.roomNumber}) has no diet plan`, to: "/diet-plans" })));
  if (staff.available === 0 && staff.busy + staff.off_duty > 0) issues.push({ key: "staff", text: "No pantry staff are available right now", to: "/staff" });

  return (
    <Card>
      <CardHeader title="Needs attention" />
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 px-5 py-6 text-sm text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> All admitted patients have an active diet plan.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {issues.map((i) => (
            <li key={i.key}>
              <Link to={i.to} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="flex-1">{i.text}</span>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function FloorOccupancy({ floors }) {
  const max = Math.max(1, ...floors.map((f) => f.count));
  return (
    <Card>
      <CardHeader title="Patients by floor" />
      {floors.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">No admitted patients.</p>
      ) : (
        <ul className="space-y-3 p-5">
          {floors.map((f) => (
            <li key={f.floor} className="text-sm">
              <div className="mb-1 flex justify-between">
                <span className="text-slate-600">{f.floor === "Unassigned" ? f.floor : `Floor ${f.floor}`}</span>
                <span className="font-medium text-slate-900">{f.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(f.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useFetch("/dashboard");

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.fullName?.split(" ")[0] || "there"}`}
        description="Here's what's happening across the hospital today."
        actions={<Button variant="secondary" icon={RefreshCw} onClick={reload} loading={loading && !!data}>Refresh</Button>}
      />

      {error && !data ? (
        <Card><ErrorState message={error} onRetry={reload} /></Card>
      ) : !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-48" />
          <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard to="/patients" icon={Users} label="Admitted patients" value={data.patients.admitted} sub={`${data.patients.discharged} discharged`} accent="bg-blue-50 text-blue-600" />
            <StatCard to="/doctors" icon={Stethoscope} label="Doctors" value={data.doctors.total} sub={`${data.doctors.available} available`} accent="bg-emerald-50 text-emerald-600" />
            <StatCard to="/diet-plans" icon={Salad} label="Active diet plans" value={data.dietPlans.active} sub={data.dietPlans.missing.length ? `${data.dietPlans.missing.length}${data.dietPlans.missing.length >= 5 ? "+" : ""} without a plan` : "Every patient covered"} accent="bg-amber-50 text-amber-600" />
            <StatCard to="/staff" icon={ChefHat} label="Pantry staff" value={data.staff.available + data.staff.busy + data.staff.off_duty} sub={`${data.staff.available} available · ${data.staff.busy} on delivery`} accent="bg-violet-50 text-violet-600" />
          </div>

          <DeliveryPipeline counts={data.deliveriesToday} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><WeeklyChart data={data.deliveredLast7Days} /></div>
            <FloorOccupancy floors={data.patientsByFloor} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><RecentActivity items={data.recentActivity} /></div>
            <Attention missing={data.dietPlans.missing} staff={data.staff} />
          </div>
        </div>
      )}
    </>
  );
}
