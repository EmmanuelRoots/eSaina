import React, { useCallback, useEffect, useState } from "react";
import {
  Pencil, Trash2, Users, Plus, Search, X, Crown, FolderKanban,
} from "lucide-react";
import { UseAuth } from "../../../context/user";
import teamApi from "../../../services/api/team.api";
import adminUserApi from "../../../services/api/adminUser.api";
import type {
  TeamDetailDTO,
  TeamMemberRole,
  TeamSummaryDTO,
} from "../../../data/dto/team";
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
type ProjectOption = { id: string; key: string; name: string };

const TeamManagement: React.FC = () => {
  const { user: currentUser } = UseAuth();

  const [teams, setTeams] = useState<TeamSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = UseDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create / edit modal
  const [editTarget, setEditTarget] = useState<TeamSummaryDTO | null>(null);
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<TeamSummaryDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Manage modal (members + projects)
  const [manageTarget, setManageTarget] = useState<TeamSummaryDTO | null>(null);
  const [detail, setDetail] = useState<TeamDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add-member search
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = UseDebounce(memberSearch, 300);
  const [candidates, setCandidates] = useState<AdminUserListItemDTO[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // Add-project search
  const [projectSearch, setProjectSearch] = useState("");
  const debouncedProjectSearch = UseDebounce(projectSearch, 300);
  const [projectCandidates, setProjectCandidates] = useState<ProjectOption[]>([]);
  const [projectCandidatesLoading, setProjectCandidatesLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teamApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setTeams(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.totalCount);
    } catch (err) {
      console.error("Erreur chargement équipes:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadDetail = useCallback(async (teamId: string) => {
    setDetailLoading(true);
    try {
      const res = await teamApi.getById(teamId);
      setDetail(res.data.data);
    } catch (err) {
      console.error("Erreur chargement équipe:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    if (!manageTarget) return;
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
  }, [debouncedMemberSearch, manageTarget]);

  const fetchProjectCandidates = useCallback(async () => {
    if (!manageTarget) return;
    setProjectCandidatesLoading(true);
    try {
      const res = await teamApi.searchProjects({
        search: debouncedProjectSearch || undefined,
        limit: 10,
      });
      setProjectCandidates(res.data.data);
    } catch (err) {
      console.error("Erreur recherche projets:", err);
    } finally {
      setProjectCandidatesLoading(false);
    }
  }, [debouncedProjectSearch, manageTarget]);

  useEffect(() => {
    if (manageTarget) {
      fetchCandidates();
      fetchProjectCandidates();
    }
  }, [fetchCandidates, fetchProjectCandidates, manageTarget]);

  const openCreate = () => {
    setCreating(true);
    setEditTarget(null);
    setEditForm({ name: "", description: "" });
    setFormError(null);
  };

  const openEdit = (target: TeamSummaryDTO) => {
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
      setFormError("Le nom de l'équipe est requis.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (creating) {
        await teamApi.create({
          name,
          description: editForm.description.trim() || null,
        });
      } else if (editTarget) {
        await teamApi.update(editTarget.id, {
          name,
          description: editForm.description.trim() || null,
        });
      }
      await fetchTeams();
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
      await teamApi.remove(deleteTarget.id);
      await fetchTeams();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeleting(false);
    }
  };

  const openManage = (target: TeamSummaryDTO) => {
    setManageTarget(target);
    setDetail(null);
    setMemberSearch("");
    setProjectSearch("");
    setCandidates([]);
    setProjectCandidates([]);
    loadDetail(target.id);
  };

  const closeManage = async () => {
    setManageTarget(null);
    setDetail(null);
    setMemberSearch("");
    setProjectSearch("");
    await fetchTeams();
  };

  const addMember = async (userId: string) => {
    if (!manageTarget) return;
    try {
      const res = await teamApi.addMembers(manageTarget.id, { userIds: [userId] });
      setDetail(res.data.data);
    } catch (err) {
      console.error("Erreur ajout membre:", err);
    }
  };

  const removeMember = async (userId: string) => {
    if (!manageTarget) return;
    try {
      const res = await teamApi.removeMember(manageTarget.id, userId);
      setDetail(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec du retrait";
      alert(msg);
    }
  };

  const toggleMemberRole = async (userId: string, current: TeamMemberRole) => {
    if (!manageTarget) return;
    const next: TeamMemberRole = current === "LEAD" ? "MEMBER" : "LEAD";
    try {
      const res = await teamApi.updateMemberRole(manageTarget.id, userId, {
        role: next,
      });
      setDetail(res.data.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Échec du changement de rôle";
      alert(msg);
    }
  };

  const addProject = async (projectId: string) => {
    if (!manageTarget) return;
    try {
      const res = await teamApi.addProjects(manageTarget.id, {
        projectIds: [projectId],
      });
      setDetail(res.data.data);
    } catch (err) {
      console.error("Erreur ajout projet:", err);
    }
  };

  const removeProject = async (projectId: string) => {
    if (!manageTarget) return;
    try {
      const res = await teamApi.removeProject(manageTarget.id, projectId);
      setDetail(res.data.data);
    } catch (err) {
      console.error("Erreur retrait projet:", err);
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

  const existingMemberIds = new Set(detail?.members.map((m) => m.userId) ?? []);
  const existingProjectIds = new Set(detail?.projects.map((p) => p.projectId) ?? []);
  const formOpen = creating || Boolean(editTarget);

  return (
    <div className="team-management-container">
      <header className="team-management-header">
        <div>
          <h1>Gestion des Équipes</h1>
          <p className="team-management-subtitle">
            Organisez vos équipes opérationnelles et rattachez-les à des projets.
          </p>
        </div>
        <button
          type="button"
          className="modal-btn modal-btn-primary team-new-btn"
          onClick={openCreate}
        >
          <Plus size={16} /> Nouvelle équipe
        </button>
      </header>

      <div className="team-toolbar">
        <div className="team-search-wrapper">
          <Search size={16} className="team-search-icon" />
          <input
            type="text"
            className="team-search"
            placeholder="Rechercher par nom ou description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="team-count">{totalCount} équipe(s)</span>
      </div>

      <div className="team-table-wrapper">
        {loading ? (
          <div className="loading">Chargement…</div>
        ) : teams.length === 0 ? (
          <div className="team-empty">Aucune équipe ne correspond.</div>
        ) : (
          <table className="team-table">
            <thead>
              <tr>
                <th>Équipe</th>
                <th>Description</th>
                <th>Membres</th>
                <th>Projets</th>
                <th>Créée le</th>
                <th className="team-table-actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="team-cell">
                      <div className="team-icon">
                        <Users size={16} />
                      </div>
                      <div className="team-cell-info">
                        <span className="team-cell-name">{t.name}</span>
                        <span className="team-cell-id" title={t.id}>
                          ID : {t.id.slice(0, 8)}…
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="team-cell-desc">
                    {t.description || <span className="team-muted">—</span>}
                  </td>
                  <td>
                    <span className="team-pill">
                      <Users size={13} /> {t.memberCount}
                    </span>
                  </td>
                  <td>
                    <span className="team-pill">
                      <FolderKanban size={13} /> {t.projectCount}
                    </span>
                  </td>
                  <td className="team-cell-date">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="team-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Gérer membres et projets"
                        onClick={() => openManage(t)}
                      >
                        <Users size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Modifier"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Supprimer"
                        onClick={() => setDeleteTarget(t)}
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

      <div className="team-pagination">
        <button
          className="modal-btn modal-btn-secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Précédent
        </button>
        <span className="team-pagination-info">
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
        <ModalHeader>{creating ? "Créer une équipe" : "Modifier l'équipe"}</ModalHeader>
        <ModalBody>
          <form id="team-form" onSubmit={submitForm} className="team-form">
            <div className="team-form-field">
              <label htmlFor="team-name">Nom</label>
              <input
                id="team-name"
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={submitting}
                autoFocus
                placeholder="Ex : Frontend, QA, Data…"
              />
            </div>

            <div className="team-form-field">
              <label htmlFor="team-description">Description</label>
              <textarea
                id="team-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                disabled={submitting}
                rows={3}
                placeholder="Quel est le périmètre de cette équipe ?"
              />
            </div>

            {creating && (
              <p className="team-form-hint">
                Vous deviendrez automatiquement LEAD de cette équipe. Vous
                pourrez ensuite ajouter des membres et rattacher des projets.
              </p>
            )}

            {formError && <div className="team-form-error">{formError}</div>}
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
            form="team-form"
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
        <ModalHeader>Supprimer l'équipe</ModalHeader>
        <ModalBody>
          {deleteTarget && (
            <p>
              Voulez-vous vraiment supprimer l'équipe{" "}
              <strong>{deleteTarget.name}</strong> ? Tous ses membres et
              rattachements de projets seront supprimés. Cette action est
              irréversible.
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

      {/* Manage modal (members + projects) */}
      <Modal
        isOpen={Boolean(manageTarget)}
        onClose={closeManage}
        size="lg"
      >
        <ModalHeader>
          {manageTarget?.name}
        </ModalHeader>
        <ModalBody>
          {detailLoading ? (
            <div className="loading">Chargement…</div>
          ) : (
            <>
              {/* Section Membres */}
              <div className="team-members-layout">
                <section className="team-members-section">
                  <h3 className="team-section-title">
                    Membres ({detail?.members.length ?? 0})
                  </h3>
                  <ul className="team-members-list">
                    {detail?.members.map((m) => (
                      <li key={m.id} className="team-member-row">
                        <Avatar user={m.user} size={32} />
                        <div className="team-member-info">
                          <div className="team-member-name">
                            {m.user.firstName} {m.user.lastName}
                          </div>
                          <div className="team-member-email">{m.user.email}</div>
                        </div>
                        <button
                          type="button"
                          className={`team-role-chip ${
                            m.role === "LEAD" ? "team-role-lead" : "team-role-member"
                          }`}
                          title={
                            m.role === "LEAD"
                              ? "Rétrograder en MEMBER"
                              : "Promouvoir LEAD"
                          }
                          onClick={() => toggleMemberRole(m.userId, m.role)}
                        >
                          {m.role === "LEAD" && <Crown size={12} />}
                          {m.role}
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Retirer de l'équipe"
                          onClick={() => removeMember(m.userId)}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                    {detail?.members.length === 0 && (
                      <li className="team-muted">Aucun membre.</li>
                    )}
                  </ul>
                </section>

                <section className="team-members-section">
                  <h3 className="team-section-title">Ajouter un membre</h3>
                  <div className="team-search-wrapper">
                    <Search size={16} className="team-search-icon" />
                    <input
                      type="text"
                      className="team-search"
                      placeholder="Rechercher un utilisateur…"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>
                  {candidatesLoading ? (
                    <div className="loading">Recherche…</div>
                  ) : (
                    <ul className="team-members-list">
                      {candidates
                        .filter((c) => !existingMemberIds.has(c.id))
                        .map((c) => (
                          <li key={c.id} className="team-member-row">
                            <Avatar user={c} size={32} />
                            <div className="team-member-info">
                              <div className="team-member-name">
                                {c.firstName} {c.lastName}
                              </div>
                              <div className="team-member-email">{c.email}</div>
                            </div>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Ajouter à l'équipe"
                              onClick={() => addMember(c.id)}
                            >
                              <Plus size={14} />
                            </button>
                          </li>
                        ))}
                      {candidates.filter((c) => !existingMemberIds.has(c.id))
                        .length === 0 && (
                        <li className="team-muted">
                          Aucun utilisateur disponible.
                        </li>
                      )}
                    </ul>
                  )}
                </section>
              </div>

              {/* Section Projets */}
              <hr className="team-divider" />
              <div className="team-members-layout">
                <section className="team-members-section">
                  <h3 className="team-section-title">
                    Projets rattachés ({detail?.projects.length ?? 0})
                  </h3>
                  <ul className="team-members-list">
                    {detail?.projects.map((p) => (
                      <li key={p.id} className="team-member-row">
                        <div className="team-project-key">{p.project.key}</div>
                        <div className="team-member-info">
                          <div className="team-member-name">{p.project.name}</div>
                          <div className="team-member-email">{p.project.key}</div>
                        </div>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Détacher le projet"
                          onClick={() => removeProject(p.projectId)}
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                    {detail?.projects.length === 0 && (
                      <li className="team-muted">Aucun projet rattaché.</li>
                    )}
                  </ul>
                </section>

                <section className="team-members-section">
                  <h3 className="team-section-title">Rattacher un projet</h3>
                  <div className="team-search-wrapper">
                    <Search size={16} className="team-search-icon" />
                    <input
                      type="text"
                      className="team-search"
                      placeholder="Rechercher un projet…"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                  </div>
                  {projectCandidatesLoading ? (
                    <div className="loading">Recherche…</div>
                  ) : (
                    <ul className="team-members-list">
                      {projectCandidates
                        .filter((p) => !existingProjectIds.has(p.id))
                        .map((p) => (
                          <li key={p.id} className="team-member-row">
                            <div className="team-project-key">{p.key}</div>
                            <div className="team-member-info">
                              <div className="team-member-name">{p.name}</div>
                              <div className="team-member-email">{p.key}</div>
                            </div>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Rattacher à l'équipe"
                              onClick={() => addProject(p.id)}
                            >
                              <Plus size={14} />
                            </button>
                          </li>
                        ))}
                      {projectCandidates.filter(
                        (p) => !existingProjectIds.has(p.id)
                      ).length === 0 && (
                        <li className="team-muted">
                          Aucun projet disponible.
                        </li>
                      )}
                    </ul>
                  )}
                </section>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={closeManage}
          >
            Fermer
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TeamManagement;
