import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ArrowRight, CalendarDays, Clock, Plus, RefreshCw, Truck, X } from "lucide-react";
import { useFetch } from "../hooks/useApi";
import { api, errorMessage, unwrap } from "../lib/api";
import { DELIVERY_STATUS, MEAL_SLOTS, NEXT_STATUS, formatTime, titleCase, todayISO } from "../lib/format";
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, Modal, PageHeader, Select, Skeleton, Textarea, Tabs, cx,
} from "../components/ui";

const COLUMNS = ["pending", "preparing", "out_for_delivery", "delivered"];
const COLUMN_ACCENT = {
  pending: "bg-slate-400",
  preparing: "bg-amber-500",
  out_for_delivery: "bg-blue-500",
  delivered: "bg-emerald-500",
};

function AssignForm({ open, onClose, date, onSaved }) {
  const { data: patients } = useFetch(open ? "/patients" : null, { status: "admitted", limit: 100, sort: "patientName" });
  const { data: staff } = useFetch(open ? "/staff" : null, { limit: 100 });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { patient: "", staff: "", mealSlot: "morning", notes: "" },
  });

  const close = () => { reset(); onClose(); };

  const onSubmit = async (values) => {
    try {
      const [y, m, d] = date.split("-").map(Number);
      const hour = { morning: 8, evening: 17, night: 20 }[values.mealSlot];
      await unwrap(api.post("/deliveries", { ...values, scheduledFor: new Date(y, m - 1, d, hour).toISOString() }));
      toast.success("Delivery assigned");
      onSaved();
      close();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const available = staff?.items.filter((s) => s.deliveryStatus !== "off_duty") || [];

  return (
    <Modal
      open={open}
      onClose={close}
      title="Assign meal delivery"
      description={`For ${new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}`}
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" form="assign-form" loading={isSubmitting}>Assign</Button>
        </>
      }
    >
      <form id="assign-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Select label="Patient" required error={errors.patient?.message} {...register("patient", { required: "Choose a patient" })}>
          <option value="">Select an admitted patient</option>
          {patients?.items.map((p) => (
            <option key={p._id} value={p._id}>{titleCase(p.patientName)} — Room {p.roomNumber}</option>
          ))}
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Meal" required {...register("mealSlot")}>
            {MEAL_SLOTS.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
          </Select>
          <Select label="Delivered by" required error={errors.staff?.message} {...register("staff", { required: "Choose a staff member" })}>
            <option value="">Select staff</option>
            {available.map((s) => (
              <option key={s._id} value={s._id}>
                {titleCase(s.name)}{s.deliveryStatus === "busy" ? " (on a delivery)" : ""}{s.openDeliveries ? ` · ${s.openDeliveries} open` : ""}
              </option>
            ))}
          </Select>
        </div>
        <Textarea label="Notes for the pantry" placeholder="Optional" {...register("notes")} />
      </form>
    </Modal>
  );
}

function DeliveryCard({ d, onAdvance, onCancel, busy }) {
  const next = NEXT_STATUS[d.status];
  const plannedMeal = d.dietPlan?.[d.mealSlot]?.meal;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{titleCase(d.patient?.patientName || "Unknown")}</div>
          <div className="text-xs text-slate-500">
            {d.patient?.floorNumber ? `F${d.patient.floorNumber} · ` : ""}Room {d.patient?.roomNumber || "—"} · Bed {d.patient?.bedNumber?.toUpperCase() || "—"}
          </div>
        </div>
        <Badge tone="violet">{titleCase(d.mealSlot)}</Badge>
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-600">
        {plannedMeal && <div><span className="text-slate-400">Meal:</span> {titleCase(plannedMeal)}</div>}
        <div><span className="text-slate-400">By:</span> {titleCase(d.staff?.name || "—")}</div>
        {d.patient?.allergies && <div className="text-amber-700">Allergic: {d.patient.allergies}</div>}
        {d.notes && <div className="italic text-slate-500">“{d.notes}”</div>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {d.status === "delivered" ? `Delivered ${formatTime(d.deliveredAt)}` : `Updated ${formatTime(d.updatedAt)}`}
        </span>
        {next && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" aria-label="Cancel delivery" title="Cancel" onClick={() => onCancel(d)} disabled={busy}>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button variant="subtle" size="sm" onClick={() => onAdvance(d, next.status)} loading={busy}>
              {next.label} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Deliveries() {
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const { data, error, loading, reload } = useFetch("/deliveries", { date, mealSlot: slot, limit: 100 });
  const items = data?.items || [];
  const cancelled = items.filter((d) => d.status === "cancelled");

  const move = async (d, status, note) => {
    setBusyId(d._id);
    try {
      const res = await api.patch(`/deliveries/${d._id}/status`, { status, note });
      toast.success(res.data.message);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
    setBusyId(null);
  };

  const confirmCancel = async () => {
    await move(cancelling, "cancelled");
    setCancelling(null);
  };

  return (
    <>
      <PageHeader
        title="Meal deliveries"
        description="Move each meal from the kitchen to the bedside. Staff availability updates automatically."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={reload} loading={loading && !!data}>Refresh</Button>
            <Button icon={Plus} onClick={() => setAssigning(true)}>Assign delivery</Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={slot} onChange={setSlot} options={[{ value: "", label: "All meals" }, ...MEAL_SLOTS.map((s) => ({ value: s, label: titleCase(s) }))]} />
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value || todayISO())} aria-label="Delivery date" className="w-44" />
          {date !== todayISO() && <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>Today</Button>}
        </div>
      </div>

      {error ? <Card><ErrorState message={error} onRetry={reload} /></Card> : !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{COLUMNS.map((c) => <Skeleton key={c} className="h-80" />)}</div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Truck}
            title="No deliveries scheduled"
            description="Assign a meal to a pantry staff member to start tracking it."
            action={<Button icon={Plus} onClick={() => setAssigning(true)}>Assign delivery</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => {
              const list = items.filter((d) => d.status === col);
              return (
                <section key={col} className="flex flex-col rounded-xl bg-slate-100/70 p-3" aria-label={DELIVERY_STATUS[col].label}>
                  <header className="mb-3 flex items-center justify-between px-1">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span className={cx("h-2 w-2 rounded-full", COLUMN_ACCENT[col])} />
                      {DELIVERY_STATUS[col].label}
                    </h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">{list.length}</span>
                  </header>
                  <div className="space-y-3">
                    {list.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">Nothing here</p>
                    ) : list.map((d) => (
                      <DeliveryCard key={d._id} d={d} busy={busyId === d._id} onAdvance={move} onCancel={setCancelling} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          {cancelled.length > 0 && (
            <p className="mt-4 text-sm text-slate-500">
              {cancelled.length} cancelled: {cancelled.map((d) => `${titleCase(d.patient?.patientName || "Unknown")} (${d.mealSlot})`).join(", ")}
            </p>
          )}
        </>
      )}

      <AssignForm open={assigning} onClose={() => setAssigning(false)} date={date} onSaved={reload} />
      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={confirmCancel}
        loading={Boolean(busyId)}
        title="Cancel this delivery?"
        description={cancelling && `${titleCase(cancelling.patient?.patientName || "")}'s ${cancelling.mealSlot} meal won't be delivered. This can't be undone.`}
        confirmLabel="Cancel delivery"
      />
    </>
  );
}
