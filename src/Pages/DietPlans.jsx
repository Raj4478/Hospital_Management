import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Coffee, Moon, Pencil, Plus, Salad, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDebounced, useFetch } from "../hooks/useApi";
import { api, errorMessage, toFormData, unwrap } from "../lib/api";
import { formatDate, titleCase } from "../lib/format";
import {
  Badge, Button, Card, EmptyState, ErrorState, Input, Modal, PageHeader, Pagination, SearchInput, Select, Skeleton, Tabs, Textarea,
} from "../components/ui";

const SLOTS = [
  { key: "morning", label: "Morning", icon: Coffee },
  { key: "evening", label: "Evening", icon: Sun },
  { key: "night", label: "Night", icon: Moon },
];

function DietPlanForm({ open, onClose, plan, onSaved }) {
  const editing = Boolean(plan);
  const { data: patients } = useFetch(open && !editing ? "/patients" : null, { status: "admitted", limit: 100, sort: "patientName" });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!open) return;
    const values = { patient: "", specialInstructions: plan?.specialInstructions || "" };
    SLOTS.forEach(({ key }) => {
      values[`${key}Meal`] = plan?.[key]?.meal || "";
      values[`${key}Ingredients`] = plan?.[key]?.ingredients || "";
    });
    reset(values);
  }, [open, plan, reset]);

  const onSubmit = async (values) => {
    try {
      if (editing) {
        const { patient: _ignored, ...rest } = values;
        await unwrap(api.patch(`/diet-plans/${plan._id}`, toFormData(rest)));
      } else {
        await unwrap(api.post("/diet-plans", toFormData(values)));
      }
      toast.success(editing ? "Diet plan updated" : "Diet plan created");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Edit diet plan" : "New diet plan"}
      description={editing ? `For ${titleCase(plan.patient?.patientName)}` : "Creating a plan replaces the patient's current one."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="diet-form" loading={isSubmitting}>{editing ? "Save changes" : "Create plan"}</Button>
        </>
      }
    >
      <form id="diet-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {!editing && (
          <Select label="Patient" required error={errors.patient?.message} {...register("patient", { required: "Choose a patient" })}>
            <option value="">Select an admitted patient</option>
            {patients?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {titleCase(p.patientName)} — Room {p.roomNumber}{p.allergies ? ` (allergic: ${p.allergies})` : ""}
              </option>
            ))}
          </Select>
        )}
        {SLOTS.map(({ key, label, icon: Icon }) => (
          <fieldset key={key} className="rounded-lg border border-slate-200 p-4">
            <legend className="flex items-center gap-1.5 px-1 text-sm font-medium text-slate-700">
              <Icon className="h-4 w-4 text-slate-400" /> {label}
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Meal" required error={errors[`${key}Meal`]?.message} {...register(`${key}Meal`, { required: `${label} meal is required` })} />
              <Input label="Ingredients / notes" {...register(`${key}Ingredients`)} />
            </div>
          </fieldset>
        ))}
        <Textarea label="Special instructions" placeholder="e.g. Low sodium, soft foods only" {...register("specialInstructions")} />
      </form>
    </Modal>
  );
}

function PlanCard({ plan, canEdit, onEdit }) {
  const p = plan.patient;
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">{titleCase(p?.patientName || "Unknown patient")}</h3>
          <p className="text-xs text-slate-500">
            {p ? `${p.floorNumber ? `Floor ${p.floorNumber} · ` : ""}Room ${p.roomNumber} · Bed ${p.bedNumber?.toUpperCase()}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!plan.active && <Badge>Archived</Badge>}
          {canEdit && plan.active && (
            <Button variant="ghost" size="icon" aria-label="Edit plan" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
          )}
        </div>
      </div>
      {p?.allergies && (
        <div className="mx-5 mt-4 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
          Allergies: {p.allergies}
        </div>
      )}
      <ul className="space-y-3 px-5 py-4">
        {SLOTS.map(({ key, label, icon: Icon }) => (
          <li key={key} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200">
              <Icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-sm font-medium text-slate-900">{titleCase(plan[key]?.meal || "—")}</div>
              {plan[key]?.ingredients && <div className="text-xs text-slate-500">{plan[key].ingredients}</div>}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        {plan.specialInstructions ? <span className="text-slate-700">{plan.specialInstructions}</span> : `Created ${formatDate(plan.createdAt)}`}
      </div>
    </Card>
  );
}

export default function DietPlans() {
  const { isManager } = useAuth();
  const [q, setQ] = useState("");
  const [active, setActive] = useState("true");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ open: false, plan: null });
  const query = useDebounced(q);

  useEffect(() => setPage(1), [query, active]);
  const { data, error, loading, reload } = useFetch("/diet-plans", { q: query, active, page, limit: 12 });

  return (
    <>
      <PageHeader
        title="Diet plans"
        description="Each admitted patient's three daily meals, as the kitchen should prepare them."
        actions={isManager && <Button icon={Plus} onClick={() => setForm({ open: true, plan: null })}>New diet plan</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={active} onChange={setActive} options={[{ value: "true", label: "Active" }, { value: "false", label: "Archived" }]} />
        <SearchInput value={q} onChange={setQ} placeholder="Search patient or meal…" className="sm:w-72" />
      </div>

      {error ? <Card><ErrorState message={error} onRetry={reload} /></Card> : !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : data.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Salad}
            title={query ? "No plans match your search" : active === "true" ? "No active diet plans" : "No archived plans"}
            description={active === "true" && !query ? "Create a plan so the pantry team knows what to prepare." : undefined}
            action={isManager && active === "true" && !query && <Button icon={Plus} onClick={() => setForm({ open: true, plan: null })}>New diet plan</Button>}
          />
        </Card>
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : undefined}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((plan) => (
              <PlanCard key={plan._id} plan={plan} canEdit={isManager} onEdit={() => setForm({ open: true, plan })} />
            ))}
          </div>
          {data.pages > 1 && <Card className="mt-4"><Pagination {...data} onPage={setPage} /></Card>}
        </div>
      )}

      <DietPlanForm open={form.open} plan={form.plan} onClose={() => setForm({ open: false, plan: null })} onSaved={reload} />
    </>
  );
}
