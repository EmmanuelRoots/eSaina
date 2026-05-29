import { useState, useEffect } from "react";
import { IssueType, type IssueDTO, type CreateIssueRequestDTO, type UpdateIssueRequestDTO, type IssueCommentDTO } from "../../data/dto/issue";
import type { UserDTO } from "../../data/dto/user";
import { useProject } from "../../context/project/useProject";
import issueApi from "../../services/api/issue.api";
import projectApi from "../../services/api/project.api";
import Row from "../row";
import { Avatar } from "../avatar";
import WorkLogList from "./WorkLogList";
import { parseDuration, formatDuration } from "./WorkLogModal";

interface IssueFormProps {
  initialData?: IssueDTO;
  onSubmit: (data: CreateIssueRequestDTO | UpdateIssueRequestDTO) => Promise<void>;
  onCancel: () => void;
  projectId: string;
  sprintId?: string | null;
}

export const IssueForm = ({ initialData, onSubmit, onCancel, projectId, sprintId: propSprintId }: IssueFormProps) => {
  const { currentProject, sprints } = useProject();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<IssueType>(initialData?.type || IssueType.TASK);
  // statusId fait référence à l'id du ProjectStatus (UUID) — source de vérité pour la colonne du board.
  // On initialise avec le statusId de l'issue ou le premier statut du projet si c'est une création.
  const [statusId, setStatusId] = useState<string | undefined>(
    initialData?.statusId ?? currentProject?.statuses?.[0]?.id
  );
  const [assigneeId, setAssigneeId] = useState<string | undefined>(initialData?.assigneeId || undefined);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(propSprintId || initialData?.sprintId || null);
  /** Membres assignables : membres de l'équipe rattachée au projet, ou membres directs si pas d'équipe. */
  const [assignableMembers, setAssignableMembers] = useState<UserDTO[]>([]);
  
  const [estimatedInput, setEstimatedInput] = useState(
    initialData?.estimatedMinutes ? formatDuration(initialData.estimatedMinutes) : ""
  );
  const [estimatedError, setEstimatedError] = useState(false);

  const [comments, setComments] = useState<IssueCommentDTO[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (initialData?.id) {
      issueApi.getComments(initialData.id).then(setComments).catch(console.error);
    }
  }, [initialData?.id]);

  // Charge les membres assignables dès que le projectId est connu
  useEffect(() => {
    projectApi.getAssignableMembers(projectId)
      .then(setAssignableMembers)
      .catch(console.error);
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedEstimated = estimatedInput.trim() ? parseDuration(estimatedInput) : null;
    if (estimatedInput.trim() && parsedEstimated === null) {
      setEstimatedError(true);
      return;
    }
    setEstimatedError(false);
    const payload: any = {
      title,
      description,
      type,
      statusId,
      // On omet les champs null/undefined pour ne pas déclencher la validation TSOA
      // (noImplicitAdditionalProperties: throw-on-extras rejette null sur number? ou string?)
      ...(assigneeId !== undefined && { assigneeId }),
      ...(selectedSprintId !== null && { sprintId: selectedSprintId }),
      ...(parsedEstimated !== null && { estimatedMinutes: parsedEstimated }),
    };

    if (!initialData) {
      payload.projectId = projectId;
    }

    await onSubmit(payload as CreateIssueRequestDTO | UpdateIssueRequestDTO);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !initialData?.id) return;
    const comment = await issueApi.addComment({ issueId: initialData.id, content: newComment });
    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
      <header>
        <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--color-text)' }}>
          {initialData ? `Modifier ${initialData.key}` : "Créer une issue"}
        </h2>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Résumé</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="De quoi s'agit-il ?" 
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Description</label>
          <textarea 
            value={description || ""} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Ajouter une description..."
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
        </div>
        
        <Row style={{ gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as IssueType)} style={selectStyle}>
              {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>État</label>
            <select value={statusId || ""} onChange={(e) => setStatusId(e.target.value || undefined)} style={selectStyle}>
              {currentProject?.statuses?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </Row>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Responsable</label>
          <select 
            value={assigneeId || ""} 
            onChange={(e) => setAssigneeId(e.target.value || undefined)} 
            style={selectStyle}
          >
            <option value="">Non assigné</option>
            {assignableMembers.map(u => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Sprint</label>
          <select 
            value={selectedSprintId || ""} 
            onChange={(e) => setSelectedSprintId(e.target.value || null)} 
            style={selectStyle}
          >
            <option value="">Backlog</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status === 'ACTIVE' ? 'Actif' : s.status === 'PLANNED' ? 'Planifié' : 'Clos'})
              </option>
            ))}
          </select>
        </div>

        {/* Champ temps estimé (visible à la création et à l'édition) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Temps estimé</label>
          <input
            value={estimatedInput}
            onChange={(e) => { setEstimatedInput(e.target.value); setEstimatedError(false); }}
            placeholder="ex : 2h 30m, 45m, 90"
            style={{ ...inputStyle, borderColor: estimatedError ? '#ef4444' : undefined }}
          />
          {estimatedError && (
            <span style={{ fontSize: '11px', color: '#ef4444' }}>
              Format invalide — utilisez : 2h 30m, 1h, 45m ou un nombre de minutes.
            </span>
          )}
        </div>

        {/* Section suivi du temps (seulement en mode édition) */}
        {initialData?.id && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
            <WorkLogList
              issueId={initialData.id}
              estimatedMinutes={initialData.estimatedMinutes}
            />
          </div>
        )}

        {initialData && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Commentaires</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Avatar user={c.author} size={28} />
                  <div style={{ background: 'var(--color-surface2)', padding: '8px', borderRadius: '8px', fontSize: '13px' }}>
                    <strong>{c.author?.firstName} {c.author?.lastName}</strong>
                    <div style={{ marginTop: '2px' }}>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                style={inputStyle}
              />
              <button type="button" onClick={handleAddComment} style={btnSecondaryStyle}>Envoyer</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button type="button" onClick={onCancel} style={btnSecondaryStyle}>Annuler</button>
          <button type="submit" style={btnPrimaryStyle}>
            {initialData ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  flex: 1,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  backgroundSize: '16px',
  paddingRight: '32px',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnSecondaryStyle,
  background: 'var(--color-primary)',
  border: '1px solid var(--color-primary)',
  color: 'white',
};
