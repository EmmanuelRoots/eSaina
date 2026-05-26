import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UseAuth } from "../../../context/user";
import roleApi from "../../../services/api/role.api";
import type { AuthorizationDto, RoleDTO } from "../../../data/dto/role";
import Modal from "../../../components/modal";
import ModalHeader from "../../../components/modal/header";
import ModalBody from "../../../components/modal/body";
import ModalFooter from "../../../components/modal/footer";
import "./index.css";

type RoleFormState = {
  name: string;
  authorizations: AuthorizationDto[];
};

type CrudKey = "create" | "read" | "update" | "delete";
const CRUD_KEYS: CrudKey[] = ["create", "read", "update", "delete"];
const CRUD_LABELS: Record<CrudKey, string> = {
  create: "Créer",
  read: "Lire",
  update: "Modifier",
  delete: "Supprimer",
};

const buildEmptyAuthorizations = (tables: string[]): AuthorizationDto[] =>
  tables.map((tableName) => ({
    tableName,
    create: false,
    read: false,
    update: false,
    delete: false,
    visibleFields: [],
  }));

const mergeWithAllTables = (
  tables: string[],
  existing: AuthorizationDto[] = []
): AuthorizationDto[] => {
  const byName = new Map(existing.map((a) => [a.tableName, a]));
  const merged = tables.map(
    (tableName) =>
      byName.get(tableName) ?? {
        tableName,
        create: false,
        read: false,
        update: false,
        delete: false,
        visibleFields: [],
      }
  );
  // Conserver les autorisations existantes pour des tables qui ne sont plus
  // exposées par l'API (legacy), affichées en fin de liste.
  const knownNames = new Set(tables);
  const legacy = existing.filter((a) => !knownNames.has(a.tableName));
  return [...merged, ...legacy];
};

const RoleManagement: React.FC = () => {
  const { user } = UseAuth();
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
  const [form, setForm] = useState<RoleFormState>({
    name: "",
    authorizations: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RoleDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await roleApi.getAllRoles();
      setRoles(res.data.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const res = await roleApi.getTables();
      setTables(res.data.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchTables()]);
      setLoading(false);
    })();
  }, [fetchRoles, fetchTables]);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ name: "", authorizations: buildEmptyAuthorizations(tables) });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (role: RoleDTO) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      authorizations: mergeWithAllTables(tables, role.authorizations ?? []),
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setIsFormOpen(false);
    setEditingRole(null);
    setFormError(null);
  };

  const toggleAuth = (tableName: string, key: CrudKey) => {
    setForm((prev) => ({
      ...prev,
      authorizations: prev.authorizations.map((auth) =>
        auth.tableName === tableName ? { ...auth, [key]: !auth[key] } : auth
      ),
    }));
  };

  const toggleTableRow = (tableName: string, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      authorizations: prev.authorizations.map((auth) =>
        auth.tableName === tableName
          ? { ...auth, create: value, read: value, update: value, delete: value }
          : auth
      ),
    }));
  };

  const toggleColumn = (key: CrudKey, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      authorizations: prev.authorizations.map((auth) => ({ ...auth, [key]: value })),
    }));
  };

  const setAllAuthorizations = (value: boolean) => {
    setForm((prev) => ({
      ...prev,
      authorizations: prev.authorizations.map((auth) => ({
        ...auth,
        create: value,
        read: value,
        update: value,
        delete: value,
      })),
    }));
  };

  const summary = useMemo(() => {
    const total = form.authorizations.length * CRUD_KEYS.length;
    const granted = form.authorizations.reduce(
      (acc, auth) => acc + CRUD_KEYS.filter((k) => auth[k]).length,
      0
    );
    return { total, granted };
  }, [form.authorizations]);

  const columnAllChecked = (key: CrudKey) =>
    form.authorizations.length > 0 && form.authorizations.every((a) => a[key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = form.name.trim();
    if (!trimmed) {
      setFormError("Le nom du rôle est obligatoire.");
      return;
    }

    const duplicate = roles.some(
      (r) =>
        r.name.toLowerCase() === trimmed.toLowerCase() &&
        r.id !== editingRole?.id
    );
    if (duplicate) {
      setFormError("Un rôle avec ce nom existe déjà.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: RoleDTO = {
        name: trimmed,
        authorizations: form.authorizations,
      };
      if (editingRole?.id) {
        await roleApi.updateRole(editingRole.id, payload);
      } else {
        await roleApi.createRole(payload);
      }
      await fetchRoles();
      setIsFormOpen(false);
      setEditingRole(null);
    } catch (err: unknown) {
      console.error("Error saving role:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Échec de l'enregistrement du rôle.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await roleApi.deleteRole(deleteTarget.id);
      await fetchRoles();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting role:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, search]);

  if (user?.role?.name !== "SUPER_ADMIN") {
    return (
      <div className="access-denied">
        Accès refusé. Vous devez être SUPER_ADMIN pour accéder à cette page.
      </div>
    );
  }

  return (
    <div className="role-management-container">
      <header className="role-management-header">
        <div>
          <h1>Gestion des Rôles</h1>
          <p className="role-management-subtitle">
            Définissez les permissions CRUD de chaque rôle sur les entités du système.
          </p>
        </div>
        <button className="add-role-btn" onClick={openCreate}>
          <span className="add-role-icon">+</span> Nouveau Rôle
        </button>
      </header>

      <div className="role-toolbar">
        <input
          type="text"
          className="role-search"
          placeholder="Rechercher un rôle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="role-count">{filteredRoles.length} rôle(s)</span>
      </div>

      <div className="role-scroll-area">
        {loading ? (
          <div className="loading">Chargement…</div>
        ) : filteredRoles.length === 0 ? (
          <div className="role-empty">Aucun rôle ne correspond.</div>
        ) : (
          <div className="role-grid">
            {filteredRoles.map((role) => {
            const auths = role.authorizations ?? [];
            const granted = auths.reduce(
              (acc, a) => acc + CRUD_KEYS.filter((k) => Boolean(a[k])).length,
              0
            );
            const total = tables.length * CRUD_KEYS.length;
            return (
              <div key={role.id} className="role-item-card">
                <div className="role-info">
                  <div className="role-info-top">
                    <h3>{role.name}</h3>
                    <span className="role-permission-ratio">
                      {granted}/{total}
                    </span>
                  </div>
                  <span className="role-id" title={role.id}>
                    ID : {role.id?.slice(0, 8)}…
                  </span>
                </div>

                <div className="role-auths">
                  <h4>Autorisations ({auths.length})</h4>
                  <div className="auth-tags">
                    {auths.slice(0, 6).map((auth, index) => {
                      const flags =
                        `${auth.create ? "C" : "·"}${auth.read ? "R" : "·"}${auth.update ? "U" : "·"}${auth.delete ? "D" : "·"}`;
                      return (
                        <span key={index} className="auth-tag" title={`${auth.tableName} → ${flags}`}>
                          <strong>{auth.tableName}</strong>
                          <span className="auth-tag-flags">{flags}</span>
                        </span>
                      );
                    })}
                    {auths.length > 6 && (
                      <span className="auth-tag auth-tag-more">+{auths.length - 6}</span>
                    )}
                  </div>
                </div>

                <div className="role-actions">
                  <button className="edit-btn" onClick={() => openEdit(role)}>
                    Modifier
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => setDeleteTarget(role)}
                    disabled={role.name === "SUPER_ADMIN"}
                    title={
                      role.name === "SUPER_ADMIN"
                        ? "Le rôle SUPER_ADMIN ne peut pas être supprimé"
                        : undefined
                    }
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} size="xl" closeOnOverlayClick={!submitting}>
        <ModalHeader>
          {editingRole ? `Modifier le rôle « ${editingRole.name} »` : "Créer un nouveau rôle"}
        </ModalHeader>
        <ModalBody>
          <form id="role-form" onSubmit={handleSubmit} className="role-form">
            <div className="role-form-field">
              <label htmlFor="role-name">Nom du rôle</label>
              <input
                id="role-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex. MANAGER, GUEST…"
                autoFocus
                disabled={submitting}
              />
            </div>

            <div className="role-form-section">
              <div className="role-form-section-header">
                <div>
                  <h3>Matrice des autorisations</h3>
                  <p className="role-form-hint">
                    {summary.granted}/{summary.total} permissions accordées
                  </p>
                </div>
                <div className="role-form-quick-actions">
                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => setAllAuthorizations(true)}
                    disabled={submitting}
                  >
                    Tout cocher
                  </button>
                  <button
                    type="button"
                    className="quick-action-btn quick-action-btn-secondary"
                    onClick={() => setAllAuthorizations(false)}
                    disabled={submitting}
                  >
                    Tout décocher
                  </button>
                </div>
              </div>

              <div className="auth-matrix-wrapper">
                <table className="auth-matrix">
                  <thead>
                    <tr>
                      <th className="auth-matrix-th-table">Table</th>
                      {CRUD_KEYS.map((key) => {
                        const allChecked = columnAllChecked(key);
                        return (
                          <th key={key} className="auth-matrix-th">
                            <button
                              type="button"
                              className="auth-matrix-col-toggle"
                              onClick={() => toggleColumn(key, !allChecked)}
                              disabled={submitting}
                              title={allChecked ? "Décocher la colonne" : "Cocher la colonne"}
                            >
                              {CRUD_LABELS[key]}
                            </button>
                          </th>
                        );
                      })}
                      <th className="auth-matrix-th-actions">Ligne</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.authorizations.map((auth) => {
                      const rowAll = CRUD_KEYS.every((k) => auth[k]);
                      const rowNone = CRUD_KEYS.every((k) => !auth[k]);
                      return (
                        <tr key={auth.tableName}>
                          <td className="auth-matrix-table-name">{auth.tableName}</td>
                          {CRUD_KEYS.map((key) => (
                            <td key={key} className="auth-matrix-cell">
                              <label className="auth-checkbox">
                                <input
                                  type="checkbox"
                                  checked={Boolean(auth[key])}
                                  onChange={() => toggleAuth(auth.tableName, key)}
                                  disabled={submitting}
                                />
                                <span className="auth-checkbox-box" />
                              </label>
                            </td>
                          ))}
                          <td className="auth-matrix-row-actions">
                            <button
                              type="button"
                              className="row-toggle-btn"
                              onClick={() => toggleTableRow(auth.tableName, !rowAll)}
                              disabled={submitting}
                            >
                              {rowAll ? "Aucun" : rowNone ? "Tous" : "Tous"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {formError && <div className="role-form-error">{formError}</div>}
          </form>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={closeForm}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="role-form"
            className="modal-btn modal-btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Enregistrement…"
              : editingRole
              ? "Enregistrer"
              : "Créer le rôle"}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        size="sm"
        variant="error"
        closeOnOverlayClick={!deleting}
      >
        <ModalHeader>Supprimer le rôle</ModalHeader>
        <ModalBody>
          <p>
            Voulez-vous vraiment supprimer le rôle{" "}
            <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
          </p>
          <p className="role-delete-warning">
            La suppression échouera si des utilisateurs sont encore rattachés à ce rôle.
          </p>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Annuler
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-danger"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression…" : "Supprimer"}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RoleManagement;
