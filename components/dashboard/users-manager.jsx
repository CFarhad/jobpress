"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { createUser, deleteUser, setUserPassword, updateUser } from "@/actions/users";
import Modal from "@/components/dashboard/modal";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";
import { RoleBadge } from "@/components/dashboard/badges";
import { ROLES, ROLE_LABEL } from "@/lib/dashboard-constants";

function generatePassword() {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789"];
  const all = sets.join("");
  const rand = (n) => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  };
  const chars = sets.map((s) => s[rand(s.length)]);
  while (chars.length < 14) chars.push(all[rand(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-label-md mb-1.5 block">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function UserFormModal({ mode, user, isSelf, onClose }) {
  const editing = mode === "edit";
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [values, setValues] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "HR",
    isActive: user?.isActive ?? true,
    password: "",
  });
  const set = (name) => (e) =>
    setValues((v) => ({ ...v, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  function submit(event) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    start(async () => {
      const result = editing
        ? await updateUser({ id: user.id, name: values.name, role: values.role, isActive: values.isActive })
        : await createUser({ name: values.name, email: values.email, role: values.role, password: values.password });
      if (result.ok) onClose();
      else {
        setErrors(result.errors ?? {});
        setMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {message && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {message}
        </p>
      )}
      <Field id="u-name" label="Full name" error={errors.name}>
        <input id="u-name" value={values.name} onChange={set("name")} className="field-control" autoComplete="off" />
      </Field>
      <Field id="u-email" label="Email" error={errors.email}>
        <input id="u-email" type="email" value={values.email} onChange={set("email")} disabled={editing} className="field-control disabled:opacity-60" autoComplete="off" />
      </Field>
      <Field id="u-role" label="Role" error={errors.role}>
        <select id="u-role" value={values.role} onChange={set("role")} disabled={isSelf} className="field-control disabled:opacity-60">
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
      </Field>

      {editing ? (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={values.isActive} onChange={set("isActive")} disabled={isSelf} className="size-4 rounded accent-[var(--color-primary)]" />
          Account active (disabled users can't sign in)
        </label>
      ) : (
        <Field id="u-password" label="Temporary password" error={errors.password}>
          <div className="flex gap-2">
            <input id="u-password" value={values.password} onChange={set("password")} className="field-control font-mono" autoComplete="off" />
            <button type="button" className="btn btn-secondary shrink-0" onClick={() => setValues((v) => ({ ...v, password: generatePassword() }))}>
              <RefreshCw className="size-4" aria-hidden /> Generate
            </button>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            Share it securely. The user can change it under Account, or reset it with "Forgot password".
          </p>
        </Field>
      )}

      {isSelf && <p className="text-xs text-on-surface-variant">You can't change your own role or status.</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {editing ? "Save changes" : "Create user"}
        </button>
      </div>
    </form>
  );
}

function PasswordModal({ user, onClose }) {
  const [pending, start] = useTransition();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    setError("");
    start(async () => {
      const result = await setUserPassword({ id: user.id, password });
      if (result.ok) onClose();
      else setError(result.errors?.password ?? result.message);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field id="np" label="New password" error={error}>
        <div className="flex gap-2">
          <input id="np" value={password} onChange={(e) => setPassword(e.target.value)} className="field-control font-mono" autoComplete="off" />
          <button type="button" className="btn btn-secondary shrink-0" onClick={() => setPassword(generatePassword())}>
            <RefreshCw className="size-4" aria-hidden /> Generate
          </button>
        </div>
      </Field>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Set password
        </button>
      </div>
    </form>
  );
}

export default function UsersManager({ users, currentUserId }) {
  const [dialog, setDialog] = useState(null); // { type: create|edit|password|delete, user }
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const close = () => {
    setDialog(null);
    setError("");
  };

  function remove() {
    start(async () => {
      const result = await deleteUser(dialog.user.id);
      if (result.ok) close();
      else setError(result.message);
    });
  }

  const iconBtn = "flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface";

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setDialog({ type: "create" })} className="btn btn-primary">
          <Plus className="size-4" aria-hidden /> Add user
        </button>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Jobs created</th>
              <th scope="col">Added</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id}>
                  <td>
                    <p className="font-semibold">
                      {u.name}
                      {isSelf && <span className="ml-2 rounded bg-surface-container-low px-1.5 py-0.5 text-xs">You</span>}
                    </p>
                    <p className="text-xs text-on-surface-variant">{u.email}</p>
                  </td>
                  <td>
                    <RoleBadge role={u.role} />
                  </td>
                  <td>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>{u.jobsCount}</td>
                  <td className="whitespace-nowrap">{u.createdLabel}</td>
                  <td>
                    <div className="flex justify-end gap-0.5">
                      <button type="button" className={iconBtn} aria-label={`Edit ${u.name}`} title="Edit" onClick={() => setDialog({ type: "edit", user: u })}>
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      <button type="button" className={iconBtn} aria-label={`Set password for ${u.name}`} title="Set password" onClick={() => setDialog({ type: "password", user: u })}>
                        <KeyRound className="size-4" aria-hidden />
                      </button>
                      {!isSelf && (
                        <button type="button" className={`${iconBtn} hover:!text-red-700`} aria-label={`Delete ${u.name}`} title="Delete" onClick={() => setDialog({ type: "delete", user: u })}>
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={dialog?.type === "create"} onClose={close} title="Add user" description="They'll be able to sign in immediately.">
        <UserFormModal mode="create" onClose={close} />
      </Modal>
      <Modal open={dialog?.type === "edit"} onClose={close} title="Edit user">
        {dialog?.type === "edit" && (
          <UserFormModal mode="edit" user={dialog.user} isSelf={dialog.user.id === currentUserId} onClose={close} />
        )}
      </Modal>
      <Modal open={dialog?.type === "password"} onClose={close} title="Set password" description={dialog?.user?.name}>
        {dialog?.type === "password" && <PasswordModal user={dialog.user} onClose={close} />}
      </Modal>
      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={close}
        title="Delete this user?"
        description={dialog?.user ? `${dialog.user.name} (${dialog.user.email}) will lose access permanently.` : ""}
        confirmLabel="Delete user"
        pending={pending}
        error={error}
        onConfirm={remove}
      />
    </>
  );
}