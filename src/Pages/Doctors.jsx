import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Globe, Mail, MoreHorizontal, Pencil, Phone, Plus, Stethoscope, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDebounced, useFetch } from "../hooks/useApi";
import { api, errorMessage, toFormData, unwrap } from "../lib/api";
import {
  Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, FileInput, Input, Modal, PageHeader,
  Pagination, SearchInput, Select, Skeleton, Textarea,
} from "../components/ui";

const EMPTY = { fullName: "", specialization: "", email: "", Contact_Number: "", experience: "", age: "", website: "", bio: "", available: "true" };

function DoctorForm({ open, onClose, doctor, onSaved }) {
  const editing = Boolean(doctor);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    reset(doctor
      ? { ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, doctor[k] ?? ""])), available: String(doctor.available ?? true) }
      : EMPTY);
  }, [open, doctor, reset]);

  const onSubmit = async (values) => {
    try {
      const body = toFormData(values);
      if (editing) await unwrap(api.patch(`/doctors/${doctor._id}`, body));
      else await unwrap(api.post("/doctors", body));
      toast.success(editing ? "Doctor updated" : "Doctor added");
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
      title={editing ? "Edit doctor" : "Add doctor"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="doctor-form" loading={isSubmitting}>{editing ? "Save changes" : "Add doctor"}</Button>
        </>
      }
    >
      <form id="doctor-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Input label="Full name" required placeholder="Dr. …" error={errors.fullName?.message} {...register("fullName", { required: "Name is required" })} />
        <Input label="Specialization" required placeholder="e.g. Cardiology" error={errors.specialization?.message} {...register("specialization", { required: "Specialization is required" })} />
        <Input label="Email" type="email" required error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
        <Input label="Phone" type="tel" required error={errors.Contact_Number?.message} {...register("Contact_Number", { required: "Phone is required", pattern: { value: /^[+\d][\d\s-]{6,18}$/, message: "Enter a valid phone number" } })} />
        <Input label="Years of experience" type="number" min={0} max={80} {...register("experience")} />
        <Input label="Age" type="number" min={18} max={100} {...register("age")} />
        <Input label="Website" type="url" placeholder="https://" className="sm:col-span-2" {...register("website")} />
        <Textarea label="Short bio" className="sm:col-span-2" maxLength={500} {...register("bio")} />
        <Select label="Availability" {...register("available")}>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </Select>
        <FileInput label="Photo" {...register("photo")} />
      </form>
    </Modal>
  );
}

function DoctorCard({ doctor, canManage, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-4">
        <Avatar name={doctor.fullName} src={doctor.coverImage} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{doctor.fullName}</h3>
          <p className="text-sm text-brand-700">{doctor.specialization}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={doctor.available === false ? "slate" : "green"} dot>{doctor.available === false ? "Unavailable" : "Available"}</Badge>
            {doctor.experience != null && <Badge>{doctor.experience} yrs exp.</Badge>}
          </div>
        </div>
        {canManage && (
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Doctor actions" onClick={() => setMenu((m) => !m)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 z-20 mt-1 w-36 animate-fade-in rounded-lg border border-slate-200 bg-white py-1 shadow-pop">
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setMenu(false); onEdit(); }}>
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenu(false); onDelete(); }}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {doctor.bio && <p className="mt-4 line-clamp-2 text-sm text-slate-600">{doctor.bio}</p>}
      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
        <a href={`mailto:${doctor.email}`} className="flex items-center gap-2 hover:text-brand-700"><Mail className="h-4 w-4 text-slate-400" /><span className="truncate">{doctor.email}</span></a>
        <a href={`tel:${doctor.Contact_Number}`} className="flex items-center gap-2 hover:text-brand-700"><Phone className="h-4 w-4 text-slate-400" />{doctor.Contact_Number}</a>
        {doctor.website && <a href={doctor.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-700"><Globe className="h-4 w-4 text-slate-400" /><span className="truncate">{doctor.website.replace(/^https?:\/\//, "")}</span></a>}
      </div>
      <div className="mt-auto pt-4 text-xs text-slate-500">
        {doctor.patientCount ? `Looking after ${doctor.patientCount} admitted patient${doctor.patientCount === 1 ? "" : "s"}` : "No admitted patients assigned"}
      </div>
    </Card>
  );
}

export default function Doctors() {
  const { isManager } = useAuth();
  const [q, setQ] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ open: false, doctor: null });
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const query = useDebounced(q);

  useEffect(() => setPage(1), [query, specialization]);

  const { data, error, loading, reload } = useFetch("/doctors", { q: query, specialization, page, limit: 12 });
  const { data: specs, reload: reloadSpecs } = useFetch("/doctors/specializations");

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/doctors/${removing._id}`);
      toast.success("Doctor removed");
      setRemoving(null);
      reload();
      reloadSpecs();
    } catch (err) {
      toast.error(errorMessage(err));
    }
    setBusy(false);
  };

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Medical staff, their specialities and who they're looking after."
        actions={isManager && <Button icon={Plus} onClick={() => setForm({ open: true, doctor: null })}>Add doctor</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={q} onChange={setQ} placeholder="Search doctors…" className="sm:w-72" />
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          aria-label="Filter by specialization"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All specializations</option>
          {specs?.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error ? <Card><ErrorState message={error} onRetry={reload} /></Card> : !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-60" />)}</div>
      ) : data.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Stethoscope}
            title={query || specialization ? "No doctors match" : "No doctors yet"}
            description={query || specialization ? "Try a different search or specialization." : "Add your medical staff so patients can be assigned to them."}
            action={isManager && !query && !specialization && <Button icon={Plus} onClick={() => setForm({ open: true, doctor: null })}>Add doctor</Button>}
          />
        </Card>
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : undefined}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((d) => (
              <DoctorCard key={d._id} doctor={d} canManage={isManager} onEdit={() => setForm({ open: true, doctor: d })} onDelete={() => setRemoving(d)} />
            ))}
          </div>
          {data.pages > 1 && <Card className="mt-4"><Pagination {...data} onPage={setPage} /></Card>}
        </div>
      )}

      <DoctorForm open={form.open} doctor={form.doctor} onClose={() => setForm({ open: false, doctor: null })} onSaved={() => { reload(); reloadSpecs(); }} />
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        loading={busy}
        title="Remove doctor?"
        description={removing && `${removing.fullName} will be removed and unassigned from their patients. This can't be undone.`}
        confirmLabel="Remove"
      />
    </>
  );
}
