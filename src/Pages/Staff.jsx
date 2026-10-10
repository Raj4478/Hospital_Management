import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ChefHat, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDebounced, useFetch } from "../hooks/useApi";
import { api, errorMessage, toFormData, unwrap } from "../lib/api";
import { STAFF_STATUS, titleCase } from "../lib/format";
import {
  Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, FileInput, Input, Modal, PageHeader, Pagination,
  SearchInput, Select, Skeleton, Tabs,
} from "../components/ui";

const EMPTY = { name: "", contactInfo: "", shift: "morning", deliveryStatus: "available" };

function StaffForm({ open, onClose, member, onSaved }) {
  const editing = Boolean(member);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(member ? { ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, member[k] ?? EMPTY[k]])) } : EMPTY);
  }, [open, member, reset]);

  const onSubmit = async (values) => {
    try {
      if (editing) await unwrap(api.patch(`/staff/${member._id}`, toFormData(values)));
      else await unwrap(api.post("/staff", toFormData(values)));
      toast.success(editing ? "Staff member updated" : "Staff member added");
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
      title={editing ? "Edit staff member" : "Add staff member"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="staff-form" loading={isSubmitting}>{editing ? "Save changes" : "Add"}</Button>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <Input className="sm:col-span-2" label="Full name" required error={errors.name?.message} {...register("name", { required: "Name is required" })} />
        <Input className="sm:col-span-2" label="Phone" type="tel" required error={errors.contactInfo?.message} {...register("contactInfo", { required: "Phone is required", pattern: { value: /^[+\d][\d\s-]{6,18}$/, message: "Enter a valid phone number" } })} />
        <Select label="Shift" {...register("shift")}>
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </Select>
        <Select label="Status" hint="Set automatically while on a delivery." {...register("deliveryStatus")}>
          {Object.entries(STAFF_STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <FileInput className="sm:col-span-2" label="Photo" {...register("photo")} />
      </form>
    </Modal>
  );
}

export default function Staff() {
  const { isManager } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ open: false, member: null });
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const query = useDebounced(q);

  useEffect(() => setPage(1), [query, status]);
  const { data, error, loading, reload } = useFetch("/staff", { q: query, status, page, limit: 15 });

  const quickStatus = async (member, deliveryStatus) => {
    try {
      await api.patch(`/staff/${member._id}`, { deliveryStatus });
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/staff/${removing._id}`);
      toast.success("Staff member removed");
      setRemoving(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
    setBusy(false);
  };

  return (
    <>
      <PageHeader
        title="Pantry staff"
        description="The team that prepares and delivers patient meals."
        actions={<Button icon={Plus} onClick={() => setForm({ open: true, member: null })}>Add staff member</Button>}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={status} onChange={setStatus} options={[{ value: "", label: "All" }, ...Object.entries(STAFF_STATUS).map(([value, s]) => ({ value, label: s.label }))]} />
          <SearchInput value={q} onChange={setQ} placeholder="Search name or phone…" className="sm:w-64" />
        </div>

        {error ? <ErrorState message={error} onRetry={reload} /> : !data ? (
          <div className="space-y-3 p-5">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title={query || status ? "No staff match" : "No pantry staff yet"}
            description={query || status ? undefined : "Add the people who prepare and deliver meals."}
            action={!query && !status && <Button icon={Plus} onClick={() => setForm({ open: true, member: null })}>Add staff member</Button>}
          />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : undefined}>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Shift</th>
                    <th>Open deliveries</th>
                    <th>Status</th>
                    <th className="text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} src={s.coverImage} size="sm" />
                          <span className="font-medium text-slate-900">{titleCase(s.name)}</span>
                        </div>
                      </td>
                      <td>
                        <a href={`tel:${s.contactInfo}`} className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />{s.contactInfo}
                        </a>
                      </td>
                      <td>{titleCase(s.shift || "morning")}</td>
                      <td>{s.openDeliveries || <span className="text-slate-400">0</span>}</td>
                      <td>
                        <Badge tone={STAFF_STATUS[s.deliveryStatus]?.tone || "slate"} dot>
                          {STAFF_STATUS[s.deliveryStatus]?.label || titleCase(s.deliveryStatus || "")}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          {s.deliveryStatus === "off_duty" ? (
                            <Button variant="ghost" size="sm" onClick={() => quickStatus(s, "available")}>Clock in</Button>
                          ) : s.deliveryStatus === "available" ? (
                            <Button variant="ghost" size="sm" onClick={() => quickStatus(s, "off_duty")}>Clock out</Button>
                          ) : null}
                          <Button variant="ghost" size="icon" aria-label={`Edit ${s.name}`} onClick={() => setForm({ open: true, member: s })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isManager && (
                            <Button variant="ghost" size="icon" aria-label={`Remove ${s.name}`} onClick={() => setRemoving(s)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...data} onPage={setPage} />
          </div>
        )}
      </Card>

      <StaffForm open={form.open} member={form.member} onClose={() => setForm({ open: false, member: null })} onSaved={reload} />
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        loading={busy}
        title="Remove staff member?"
        description={removing && `${titleCase(removing.name)} will be removed from the pantry team.`}
        confirmLabel="Remove"
      />
    </>
  );
}
