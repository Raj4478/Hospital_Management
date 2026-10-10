import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Download, Pencil, Plus, UserMinus, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDebounced, useFetch } from "../hooks/useApi";
import { api, downloadFile, errorMessage, toFormData, unwrap } from "../lib/api";
import { BLOOD_GROUPS, DELIVERY_STATUS, formatDate, titleCase, todayISO } from "../lib/format";
import {
  Avatar, Badge, Button, Card, ConfirmDialog, DetailList, Drawer, EmptyState, ErrorState, FileInput, Input, Modal,
  PageHeader, Pagination, SearchInput, Select, Skeleton, Spinner, Tabs,
} from "../components/ui";

const EMPTY = {
  patientName: "", age: "", gender: "", bloodGroup: "", disease: "", organAffected: "", allergies: "",
  floorNumber: "", roomNumber: "", bedNumber: "", assignedDoctor: "", contactInformation: "", emergencyContact: "",
};

function PatientForm({ open, onClose, patient, onSaved }) {
  const editing = Boolean(patient);
  const { data: doctors } = useFetch(open ? "/doctors" : null, { limit: 100 });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(patient ? {
      ...EMPTY,
      ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, patient[k] ?? ""])),
      assignedDoctor: patient.assignedDoctor?._id || patient.assignedDoctor || "",
      bloodGroup: patient.bloodGroup?.toUpperCase() || "",
      status: patient.status || "admitted",
    } : EMPTY);
  }, [open, patient, reset]);

  const onSubmit = async (values) => {
    try {
      const body = toFormData(values);
      const saved = editing
        ? await unwrap(api.patch(`/patients/${patient._id}`, body))
        : await unwrap(api.post("/patients", body));
      toast.success(editing ? "Patient updated" : "Patient admitted");
      onSaved(saved);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const req = (label) => ({ required: `${label} is required` });
  const phone = { pattern: { value: /^[+\d][\d\s-]{6,18}$/, message: "Enter a valid phone number" } };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? "Edit patient" : "Admit patient"}
      description={editing ? titleCase(patient.patientName) : "Fields marked * are required."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="patient-form" loading={isSubmitting}>{editing ? "Save changes" : "Admit patient"}</Button>
        </>
      }
    >
      <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Personal details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Input className="sm:col-span-6" label="Full name" required error={errors.patientName?.message} {...register("patientName", req("Name"))} />
            <Input className="sm:col-span-2" label="Age" type="number" min={0} max={130} error={errors.age?.message} {...register("age", { min: { value: 0, message: "Invalid age" }, max: { value: 130, message: "Invalid age" } })} />
            <Select className="sm:col-span-2" label="Gender" {...register("gender")}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Select className="sm:col-span-2" label="Blood group" required error={errors.bloodGroup?.message} {...register("bloodGroup", req("Blood group"))}>
              <option value="">Select</option>
              {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
            </Select>
            <Input className="sm:col-span-3" label="Phone" type="tel" error={errors.contactInformation?.message} {...register("contactInformation", phone)} />
            <Input className="sm:col-span-3" label="Emergency contact" type="tel" error={errors.emergencyContact?.message} {...register("emergencyContact", phone)} />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Medical</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Condition" required error={errors.disease?.message} {...register("disease", req("Condition"))} />
            <Input label="Organ affected" {...register("organAffected")} />
            <Input className="sm:col-span-2" label="Allergies" placeholder="e.g. Peanuts, lactose" hint="Shown to the pantry team on every delivery." {...register("allergies")} />
            <Select className="sm:col-span-2" label="Doctor in charge" {...register("assignedDoctor")}>
              <option value="">Not assigned</option>
              {doctors?.items.map((d) => <option key={d._id} value={d._id}>{d.fullName} — {d.specialization}</option>)}
            </Select>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Bed</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Floor" {...register("floorNumber")} />
            <Input label="Room" required error={errors.roomNumber?.message} {...register("roomNumber", req("Room"))} />
            <Input label="Bed" required error={errors.bedNumber?.message} {...register("bedNumber", req("Bed"))} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {editing && (
            <Select label="Status" {...register("status")}>
              <option value="admitted">Admitted</option>
              <option value="discharged">Discharged</option>
            </Select>
          )}
          <FileInput className={editing ? undefined : "sm:col-span-2"} label="Photo" {...register("photo")} />
        </div>
      </form>
    </Modal>
  );
}

function PatientDrawer({ id, onClose, onEdit, onChanged }) {
  const { isManager } = useAuth();
  const { data: p, loading, error, reload } = useFetch(id ? `/patients/${id}` : null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const discharge = async () => {
    setBusy(true);
    try {
      await api.post(`/patients/${id}/discharge`);
      toast.success("Patient discharged. Diet plan closed and open deliveries cancelled.");
      setConfirm(false);
      reload();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
    setBusy(false);
  };

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      title="Patient details"
      footer={isManager && p && p._id === id && (
        <>
          {p.status === "admitted" && <Button variant="secondary" icon={UserMinus} onClick={() => setConfirm(true)}>Discharge</Button>}
          <Button icon={Pencil} onClick={() => onEdit(p)}>Edit</Button>
        </>
      )}
    >
      {error ? <ErrorState message={error} onRetry={reload} /> : loading || !p || p._id !== id ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar name={p.patientName} src={p.coverImage} size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{titleCase(p.patientName)}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge tone={p.status === "admitted" ? "green" : "slate"} dot>{titleCase(p.status)}</Badge>
                <Badge tone="red">{p.bloodGroup?.toUpperCase()}</Badge>
              </div>
            </div>
          </div>

          {p.allergies && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <span className="font-medium">Allergies:</span> {p.allergies}
            </div>
          )}

          <DetailList items={[
            ["Condition", titleCase(p.disease)],
            ["Organ affected", titleCase(p.organAffected)],
            ["Age / gender", [p.age, titleCase(p.gender || "")].filter(Boolean).join(" · ")],
            ["Bed", `${p.floorNumber ? `Floor ${p.floorNumber} · ` : ""}Room ${p.roomNumber} · Bed ${p.bedNumber?.toUpperCase()}`],
            ["Doctor", p.assignedDoctor && `${p.assignedDoctor.fullName} (${p.assignedDoctor.specialization})`],
            ["Admitted", formatDate(p.admittedAt || p.createdAt)],
            ["Phone", p.contactInformation],
            ["Emergency contact", p.emergencyContact],
            ...(p.dischargedAt ? [["Discharged", formatDate(p.dischargedAt)]] : []),
          ]} />

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current diet plan</h4>
            {p.dietPlan ? (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {["morning", "evening", "night"].map((slot) => (
                  <div key={slot} className="flex gap-3 px-3 py-2 text-sm">
                    <span className="w-16 shrink-0 text-slate-500">{titleCase(slot)}</span>
                    <span className="text-slate-900">{titleCase(p.dietPlan[slot]?.meal)}</span>
                  </div>
                ))}
                {p.dietPlan.specialInstructions && <p className="px-3 py-2 text-xs text-slate-600">{p.dietPlan.specialInstructions}</p>}
              </div>
            ) : <p className="text-sm text-slate-500">No active diet plan.</p>}
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent deliveries</h4>
            {p.deliveries?.length ? (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {p.deliveries.map((d) => (
                  <li key={d._id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-slate-700">{formatDate(d.scheduledFor)} · {titleCase(d.mealSlot)}</span>
                    <Badge tone={DELIVERY_STATUS[d.status].tone}>{DELIVERY_STATUS[d.status].label}</Badge>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No deliveries yet.</p>}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={discharge}
        loading={busy}
        title="Discharge patient?"
        description="Their diet plan will be closed and any open meal deliveries will be cancelled. You can re-admit them later by editing the record."
        confirmLabel="Discharge"
      />
    </Drawer>
  );
}

export default function Patients() {
  const { isManager } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("admitted");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ open: false, patient: null });
  const query = useDebounced(q);

  useEffect(() => setPage(1), [query, status]);

  const { data, loading, error, reload } = useFetch("/patients", { q: query, status: status === "all" ? "" : status, page, limit: 15 });

  const exportCsv = async () => {
    try {
      await downloadFile(`/patients/export${status === "all" ? "" : `?status=${status}`}`, `patients-${todayISO()}.csv`);
    } catch (err) {
      toast.error(errorMessage(err, "Export failed"));
    }
  };

  return (
    <>
      <PageHeader
        title="Patients"
        description="Everyone admitted to the hospital, their bed and their care team."
        actions={isManager && (
          <>
            <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
            <Button icon={Plus} onClick={() => setForm({ open: true, patient: null })}>Admit patient</Button>
          </>
        )}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={status} onChange={setStatus} options={[
            { value: "admitted", label: "Admitted" },
            { value: "discharged", label: "Discharged" },
            { value: "all", label: "All" },
          ]} />
          <SearchInput value={q} onChange={setQ} placeholder="Search name, condition, room…" className="sm:w-72" />
        </div>

        {error ? <ErrorState message={error} onRetry={reload} /> : !data ? (
          <div className="space-y-3 p-5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? "No patients match your search" : "No patients here yet"}
            description={query ? "Try a different name, condition or room number." : isManager ? "Admit the first patient to get started." : undefined}
            action={!query && isManager && <Button icon={Plus} onClick={() => setForm({ open: true, patient: null })}>Admit patient</Button>}
          />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : undefined}>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Condition</th>
                    <th>Bed</th>
                    <th>Blood</th>
                    <th>Doctor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p._id} className="clickable" onClick={() => setSelected(p._id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelected(p._id)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={p.patientName} src={p.coverImage} size="sm" />
                          <div>
                            <div className="font-medium text-slate-900">{titleCase(p.patientName)}</div>
                            <div className="text-xs text-slate-500">{[p.age && `${p.age} yrs`, p.gender && titleCase(p.gender)].filter(Boolean).join(" · ") || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{titleCase(p.disease)}</div>
                        {p.allergies && <div className="text-xs text-amber-700">Allergic: {p.allergies}</div>}
                      </td>
                      <td>{p.floorNumber ? `F${p.floorNumber} · ` : ""}R{p.roomNumber} · {p.bedNumber?.toUpperCase()}</td>
                      <td><Badge tone="red">{p.bloodGroup?.toUpperCase()}</Badge></td>
                      <td className="text-slate-600">{p.assignedDoctor?.fullName || "—"}</td>
                      <td><Badge tone={p.status === "admitted" ? "green" : "slate"} dot>{titleCase(p.status || "admitted")}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...data} onPage={setPage} />
          </div>
        )}
      </Card>

      <PatientDrawer
        id={selected}
        onClose={() => setSelected(null)}
        onEdit={(p) => setForm({ open: true, patient: p })}
        onChanged={reload}
      />
      <PatientForm
        open={form.open}
        patient={form.patient}
        onClose={() => setForm({ open: false, patient: null })}
        onSaved={() => { reload(); if (form.patient) setSelected(null); }}
      />
    </>
  );
}
