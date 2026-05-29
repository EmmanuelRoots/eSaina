import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Users, Plus, Search, X, Crown } from "lucide-react";
import { UseAuth } from "../../../context/user";
import groupApi from "../../../services/api/group.api";
import adminUserApi from "../../../services/api/adminUser.api";
import type {
  GroupDetailDTO,
  GroupMemberRole,
  GroupSummaryDTO,
} from "../../../data/dto/group";
import type { AdminUserListItemDTO } from "../../../data/dto/adminUser";
import { Avatar } from "../../../components/avatar";
import Modal from "../../../components/modal";
import ModalHeader from "../../../components/modal/header";
import ModalBody from "../../../components/modal/body";
import ModalFooter from "../../../components/modal/footer";
import UseDebounce from "../../../hooks/debounce";
import "./index.css";

const PAGE_SIZE = 20;
const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN"];

type EditFormState = { name: string; description: string };

const GroupManagement: React.FC = () => {
  const { user: currentUser } = UseAuth();

  const [groups, setGroups] = useState<GroupSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = UseDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create / edit modal
  const [editTarget, setEditTarget] = useState<GroupSummaryDTO | null>(null);
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<GroupSummaryDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Members modal
  const [membersTarget, setMembersTarget] = useState<GroupSummaryDTO | null>(null);
  const [membersDetail, setMembersDetail] = useState<GroupDetailDTO | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);

  // Add-member search
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = UseDebounce(memberSearch, 300);
  const [candidates, setCandidates] = useState<AdminUserListItemDTO[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await groupApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setGroups(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.totalCount);
    } catch (err) {
      console.error("Erreur chargement groupes:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadMembers = useCallback(async (groupId: string) => {
    setMembersLoading(true);
    try {
      const res = await groupApi.getById(groupId);
      setMembersDetail(res.data.data);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    if (!membersTarget) return;
    setCandidatesLoading(true);
    try {
      const res = await adminUserApi.list({
        page: 1,
        limit: 10,
        search: debouncedMemberSearch || undefined,
        active: true,
      });
      setCandidates(res.data.data);
    } catch (err) {
      console.error("Erreur recherche utilisateurs:", err);
    } finally {
      setCandidatesLoading(false);
    }
  }, [debouncedMemberSearch, membersTarget]);

  useEffect(() => {
    if (membersTarget) fetchCandidates();
  }, [fetchCandidates, membersTarget]);

  const openCreate = () => {
    setCreating(true);
    setEditTarget(null);
    setEditForm({ name: "", description: "" });
    setFormError(null);
  };

  const openEdit = (target: GroupSummaryDTO) => {
    setEditTarget(target);
    setCreating(false);
    setEditForm({ name: target.name, description: target.description ?? "" });
    setFormError(null);
  };

  const closeForm = () => {
    if (submitting) return;
    setEditTarget(null);
    setCreating(false);
    setFormError(null);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = editForm.name.trim();
    if (!name) {
      setFormError("Le nom du groupe est requis.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (creating) {
        await groupApi.create({
          name,
          description: editForm.description.trim() || null,
        });
      } else if (editTarget) {
        await groupApi.update(editTarget.id, {
          name,
          description: editForm.description.trim() || null,
        });
      }
      await fetchGroups();
      setEditTarget(null);
      setCreating(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec de l'enregistrement";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await groupApi.remove(deleteTarget.id);
      await fetchGroups();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeleting(false);
    }
  };

  const openMembers = (target: GroupSummaryDTO) => {
    setMembersTarget(target);
    setMembersDetail(null);
    setMemberSearch("");
    setCandidates([]);
    loadMembers(target.id);
  };

  const closeMembers = async () => {
    setMembersTarget(null);
    setMembersDetail(null);
    setMemberSearch("");
    // Refresh list so memberCount stays accurate.
    await fetchGroups();
  };

  const addMember = async (userId: string) => {
    if (!membersTarget) return;
    try {
      const res = await groupApi.addMembers(membersTarget.id, { userIds: [userId] });
      setMembersDetail(res.data.data);
    } catch (err) {
      console.error("Erreur ajout membre:", err);
    }
  };

  const removeMember = async (userId: string) => {
    if (!membersTarget) return;
    try {
      const res = await groupApi.removeMember(membersTarget.id, userId);
      setMembersDetail(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec du retrait";
      alert(msg);
    }
  };

  const toggleMemberRole = async (userId: string, current: GroupMemberRole) => {
    if (!membersTarget) return;
    const next: GroupMemberRole = current === "OWNER" ? "MEMBER" : "OWNER";
    try {
      const res = await groupApi.updateMemberRole(membersTarget.id, userId, {
        role: next,
      });
      setMembersDetail(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec du changement de rôle";
      alert(msg);
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

  const existingMemberIds = new Set(membersDetail?.members.map((m) => m.userId) ?? []);
  const formOpen = creating || Boolean(editTarget);

  return (
    <div className="group-management-container">
      <header className="group-management-header">
        <div>
          <h1>Gestion des Groupes</h1>
          <p className="group-management-subtitle">
            Créez des groupes transverses et gérez leurs membres.
          </p>
        </div>
        <button
          type="button"
          className="modal-btn modal-btn-primary group-new-btn"
          onClick={openCreate}
        >
          <Plus size={16} /> Nouveau groupe
        </button>
      </header>

      <div className="group-toolbar">
        <div className="group-search-wrapper">
          <Search size={16} className="group-search-icon" />
          <input
            type="text"
            className="group-search"
            placeholder="Rechercher par nom ou description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="group-count">{totalCount} groupe(s)</span>
      </div>

      <div className="group-table-wrapper">
        {loading ? (
          <div className="loading">Chargement…</div>
        ) : groups.length === 0 ? (
          <div className="group-empty">Aucun groupe ne correspond.</div>
        ) : (
          <table className="group-table">
            <thead>
              <tr>
                <th>Groupe</th>
                <th>Description</th>
                <th>Membres</th>
                <th>Créé le</th>
                <th className="group-table-actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="group-cell">
                      <div className="group-icon">
                        <Users size={16} />
                      </div>
                      <div className="group-cell-info">
                        <span className="group-cell-name">{g.name}</span>
                        <span className="group-cell-id" title={g.id}>
                          ID : {g.id.slice(0, 8)}…
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="group-cell-desc">
                    {g.description || <span className="group-muted">—</span>}
                  </td>
                  <td>
                    <span className="group-member-count">
                      <Users size={13} /> {g.memberCount}
                    </span>
                  </td>
                  <td className="group-cell-date">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="group-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Gérer les membres"
                        onClick={() => openMembers(g)}
                      >
                        <Users size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Modifier"
                        onClick={() => openEdit(g)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Supprimer"
                        onClick={() => setDeleteTarget(g)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="group-pagination">
        <button
          className="modal-btn modal-btn-secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Précédent
        </button>
        <span className="group-pagination-info">
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

      {/* Create / Edit modal */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        size="md"
        closeOnOverlayClick={!submitting}
      >
        <ModalHeader>{creating ? "Créer un groupe" : "Modifier le groupe"}</ModalHeader>
        <ModalBody>
          <form id="group-form" onSubmit={submitForm} className="group-form">
            <div className="group-form-field">
              <label htmlFor="group-name">Nom</label>
              <input
                id="group-name"
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={submitting}
                autoFocus
                placeholder="Ex : Veille sécurité"
              />
            </div>

            <div className="group-form-field">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                disabled={submitting}
                rows={3}
                placeholder="À quoi sert ce groupe ?"
              />
            </div>

            {creating && (
              <p className="group-form-hint">
                Vous deviendrez automatiquement OWNER de ce groupe. Vous pourrez
                ensuite ajouter des membres.
              </p>
            )}

            {formError && <div className="group-form-error">{formError}</div>}
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
            form="group-form"
            className="modal-btn modal-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Enregistrement…" : creating ? "Créer" : "Enregistrer"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        size="sm"
        variant="error"
        closeOnOverlayClick={!deleting}
      >
        <ModalHeader>Supprimer le groupe</ModalHeader>
        <ModalBody>
          {deleteTarget && (
            <p>
              Voulez-vous vraiment supprimer le groupe{" "}
              <strong>{deleteTarget.name}</strong> ? Tous ses membres seront
              retirés. Cette action est irréversible.
            </p>
          )}
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

      {/* Members modal */}
      <Modal
        isOpen={Boolean(membersTarget)}
        onClose={closeMembers}
        size="lg"
      >
        <ModalHeader>
          Membres de {membersTarget?.name}
        </ModalHeader>
        <ModalBody>
          {membersLoading ? (
            <div className="loading">Chargement des membres…</div>
          ) : (
            <div className="group-members-layout">
              <section className="group-members-section">
                <h3 className="group-section-title">
                  Membres actuels ({membersDetail?.members.length ?? 0})
                </h3>
                <ul className="group-members-list">
                  {membersDetail?.members.map((m) => (
                    <li key={m.id} className="group-member-row">
                      <Avatar user={m.user} size={32} />
                      <div className="group-member-info">
                        <div className="group-member-name">
                          {m.user.firstName} {m.user.lastName}
                        </div>
                        <div className="group-member-email">{m.user.email}</div>
                      </div>
                      <button
                        type="button"
                        className={`group-role-chip ${
                          m.role === "OWNER" ? "group-role-owner" : "group-role-member"
                        }`}
                        title={
                          m.role === "OWNER"
                            ? "Rétrograder en MEMBER"
                            : "Promouvoir OWNER"
                        }
                        onClick={() => toggleMemberRole(m.userId, m.role)}
                      >
                        {m.role === "OWNER" && <Crown size={12} />}
                        {m.role}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Retirer du groupe"
                        onClick={() => removeMember(m.userId)}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                  {membersDetail?.members.length === 0 && (
                    <li className="group-muted">Aucun membre.</li>
                  )}
                </ul>
              </section>

              <section className="group-members-section">
                <h3 className="group-section-title">Ajouter un membre</h3>
                <div className="group-search-wrapper">
                  <Search size={16} className="group-search-icon" />
                  <input
                    type="text"
                    className="group-search"
                    placeholder="Rechercher un utilisateur…"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                </div>
                {candidatesLoading ? (
                  <div className="loading">Recherche…</div>
                ) : (
                  <ul className="group-members-list">
                    {candidates
                      .filter((c) => !existingMemberIds.has(c.id))
                      .map((c) => (
                        <li key={c.id} className="group-member-row">
                          <Avatar user={c} size={32} />
                          <div className="group-member-info">
                            <div className="group-member-name">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="group-member-email">{c.email}</div>
                          </div>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Ajouter au groupe"
                            onClick={() => addMember(c.id)}
                          >
                            <Plus size={14} />
                          </button>
                        </li>
                      ))}
                    {candidates.filter((c) => !existingMemberIds.has(c.id)).length ===
                      0 && (
                      <li className="group-muted">
                        Aucun utilisateur disponible.
                      </li>
                    )}
                  </ul>
                )}
              </section>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={closeMembers}
          >
            Fermer
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GroupManagement;
