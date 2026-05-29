import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, KeyRound, UserX, UserCheck, Search } from "lucide-react";
import { UseAuth } from "../../../context/user";
import adminUserApi from "../../../services/api/adminUser.api";
import roleApi from "../../../services/api/role.api";
import type {
  AdminUserListItemDTO,
  AdminUserUpdateDTO,
} from "../../../data/dto/adminUser";
import type { RoleDTO } from "../../../data/dto/role";
import { Avatar } from "../../../components/avatar";
import Modal from "../../../components/modal";
import ModalHeader from "../../../components/modal/header";
import ModalBody from "../../../components/modal/body";
import ModalFooter from "../../../components/modal/footer";
import UseDebounce from "../../../hooks/debounce";
import "./index.css";

const PAGE_SIZE = 20;
const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

type EditFormState = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId: string;
  active: boolean;
};

const UserManagement: React.FC = () => {
  const { user: currentUser } = UseAuth();
  const isSuperAdmin = currentUser?.role?.name === "SUPER_ADMIN";

  const [users, setUsers] = useState<AdminUserListItemDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = UseDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [editTarget, setEditTarget] = useState<AdminUserListItemDTO | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    roleId: "",
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [resetTarget, setResetTarget] = useState<AdminUserListItemDTO | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [deactivateTarget, setDeactivateTarget] = useState<AdminUserListItemDTO | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        roleId: roleFilter || undefined,
        active:
          statusFilter === "all" ? undefined : statusFilter === "active",
      });
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.totalCount);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await roleApi.getAllRoles();
      setRoles(res.data.data);
    } catch (err) {
      console.error("Erreur chargement rôles:", err);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const assignableRoles = useMemo(() => {
    if (isSuperAdmin) return roles;
    return roles.filter((r) => r.name !== "SUPER_ADMIN");
  }, [roles, isSuperAdmin]);

  const openEdit = (target: AdminUserListItemDTO) => {
    setEditTarget(target);
    setEditForm({
      firstName: target.firstName ?? "",
      lastName: target.lastName ?? "",
      phoneNumber: target.phoneNumber ?? "",
      roleId: target.roleId,
      active: target.active,
    });
    setFormError(null);
  };

  const closeEdit = () => {
    if (submitting) return;
    setEditTarget(null);
    setFormError(null);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: AdminUserUpdateDTO = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        roleId: editForm.roleId,
        active: editForm.active,
      };
      await adminUserApi.update(editTarget.id, payload);
      await fetchUsers();
      setEditTarget(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec de la mise à jour";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openReset = (target: AdminUserListItemDTO) => {
    setResetTarget(target);
    setNewPassword("");
    setResetError(null);
  };

  const submitReset = async () => {
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      setResetError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setResetting(true);
    setResetError(null);
    try {
      await adminUserApi.resetPassword(resetTarget.id, newPassword);
      setResetTarget(null);
      setNewPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec de la réinitialisation";
      setResetError(msg);
    } finally {
      setResetting(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      if (deactivateTarget.active) {
        await adminUserApi.deactivate(deactivateTarget.id);
      } else {
        await adminUserApi.update(deactivateTarget.id, { active: true });
      }
      await fetchUsers();
      setDeactivateTarget(null);
    } catch (err) {
      console.error("Erreur (dés)activation:", err);
    } finally {
      setDeactivating(false);
    }
  };

  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role?.name ?? "")) {
    return (
      <div className="access-denied">
        Accès refusé. Vous devez être ADMIN ou SUPER_ADMIN pour accéder à cette
        page.
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <header className="user-management-header">
        <div>
          <h1>Gestion des Utilisateurs</h1>
          <p className="user-management-subtitle">
            Consultez, modifiez le rôle ou désactivez les comptes utilisateurs.
          </p>
        </div>
      </header>

      <div className="user-toolbar">
        <div className="user-search-wrapper">
          <Search size={16} className="user-search-icon" />
          <input
            type="text"
            className="user-search"
            placeholder="Rechercher par nom, email, téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="user-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className="user-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "active" | "inactive")
          }
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Désactivés</option>
        </select>
        <span className="user-count">{totalCount} utilisateur(s)</span>
      </div>

      <div className="user-table-wrapper">
        {loading ? (
          <div className="loading">Chargement…</div>
        ) : users.length === 0 ? (
          <div className="user-empty">Aucun utilisateur ne correspond.</div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th className="user-table-actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isSuperAdminTarget = u.role?.name === "SUPER_ADMIN";
                const canMutate = isSuperAdmin || !isSuperAdminTarget;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <Avatar user={u} size={32} />
                        <div className="user-cell-info">
                          <span className="user-cell-name">
                            {u.firstName} {u.lastName}
                            {isSelf && (
                              <span className="user-self-tag">vous</span>
                            )}
                          </span>
                          <span className="user-cell-id" title={u.id}>
                            ID : {u.id.slice(0, 8)}…
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="user-cell-email">{u.email}</td>
                    <td>{u.phoneNumber || "—"}</td>
                    <td>
                      <span className={`role-badge role-${u.role?.name?.toLowerCase() ?? "user"}`}>
                        {u.role?.name ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${u.active ? "status-active" : "status-inactive"}`}
                      >
                        {u.active ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Modifier"
                          onClick={() => openEdit(u)}
                          disabled={!canMutate}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Réinitialiser le mot de passe"
                          onClick={() => openReset(u)}
                          disabled={!canMutate}
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          type="button"
                          className={`icon-btn ${u.active ? "icon-btn-danger" : "icon-btn-success"}`}
                          title={u.active ? "Désactiver" : "Réactiver"}
                          onClick={() => setDeactivateTarget(u)}
                          disabled={!canMutate || isSelf}
                        >
                          {u.active ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="user-pagination">
        <button
          className="modal-btn modal-btn-secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Précédent
        </button>
        <span className="user-pagination-info">
          Page {page} / {totalPages}
        </span>
        <button
          className="modal-btn modal-btn-secondary"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >
          Suivant
        </button>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={closeEdit}
        size="md"
        closeOnOverlayClick={!submitting}
      >
        <ModalHeader>
          Modifier l'utilisateur
        </ModalHeader>
        <ModalBody>
          {editTarget && (
            <form id="user-edit-form" onSubmit={submitEdit} className="user-form">
              <div className="user-form-row">
                <div className="user-form-field">
                  <label htmlFor="user-firstName">Prénom</label>
                  <input
                    id="user-firstName"
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="user-form-field">
                  <label htmlFor="user-lastName">Nom</label>
                  <input
                    id="user-lastName"
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="user-form-field">
                <label htmlFor="user-phone">Téléphone</label>
                <input
                  id="user-phone"
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  disabled={submitting}
                />
              </div>

              <div className="user-form-field">
                <label htmlFor="user-role">Rôle</label>
                <select
                  id="user-role"
                  value={editForm.roleId}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, roleId: e.target.value }))
                  }
                  disabled={submitting}
                >
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {!isSuperAdmin && (
                  <p className="user-form-hint">
                    Seul un SUPER_ADMIN peut attribuer le rôle SUPER_ADMIN.
                  </p>
                )}
              </div>

              <div className="user-form-field">
                <label className="user-toggle">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, active: e.target.checked }))
                    }
                    disabled={submitting || editTarget.id === currentUser?.id}
                  />
                  <span>Compte actif</span>
                </label>
                {editTarget.id === currentUser?.id && (
                  <p className="user-form-hint">
                    Vous ne pouvez pas désactiver votre propre compte.
                  </p>
                )}
              </div>

              {formError && <div className="user-form-error">{formError}</div>}
            </form>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={closeEdit}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="user-edit-form"
            className="modal-btn modal-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Reset password modal */}
      <Modal
        isOpen={Boolean(resetTarget)}
        onClose={() => !resetting && setResetTarget(null)}
        size="sm"
        closeOnOverlayClick={!resetting}
      >
        <ModalHeader>Réinitialiser le mot de passe</ModalHeader>
        <ModalBody>
          {resetTarget && (
            <div className="user-form">
              <p>
                Nouveau mot de passe pour{" "}
                <strong>
                  {resetTarget.firstName} {resetTarget.lastName}
                </strong>{" "}
                ({resetTarget.email}).
              </p>
              <div className="user-form-field">
                <label htmlFor="reset-password">Nouveau mot de passe</label>
                <input
                  id="reset-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                  disabled={resetting}
                  placeholder="Au moins 6 caractères"
                />
              </div>
              <p className="user-form-hint">
                Toutes les sessions actives de cet utilisateur seront
                déconnectées.
              </p>
              {resetError && <div className="user-form-error">{resetError}</div>}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={() => setResetTarget(null)}
            disabled={resetting}
          >
            Annuler
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-primary"
            onClick={submitReset}
            disabled={resetting}
          >
            {resetting ? "Réinitialisation…" : "Réinitialiser"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Deactivate / Reactivate modal */}
      <Modal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => !deactivating && setDeactivateTarget(null)}
        size="sm"
        variant={deactivateTarget?.active ? "error" : undefined}
        closeOnOverlayClick={!deactivating}
      >
        <ModalHeader>
          {deactivateTarget?.active
            ? "Désactiver l'utilisateur"
            : "Réactiver l'utilisateur"}
        </ModalHeader>
        <ModalBody>
          {deactivateTarget && (
            <p>
              Voulez-vous vraiment{" "}
              {deactivateTarget.active ? "désactiver" : "réactiver"} le compte
              de{" "}
              <strong>
                {deactivateTarget.firstName} {deactivateTarget.lastName}
              </strong>{" "}
              ?
              {deactivateTarget.active && (
                <>
                  {" "}
                  Ses sessions actives seront déconnectées et il ne pourra plus
                  se connecter tant que le compte reste désactivé.
                </>
              )}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={() => setDeactivateTarget(null)}
            disabled={deactivating}
          >
            Annuler
          </button>
          <button
            type="button"
            className={`modal-btn ${deactivateTarget?.active ? "modal-btn-danger" : "modal-btn-primary"}`}
            onClick={confirmDeactivate}
            disabled={deactivating}
          >
            {deactivating
              ? "En cours…"
              : deactivateTarget?.active
              ? "Désactiver"
              : "Réactiver"}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserManagement;
