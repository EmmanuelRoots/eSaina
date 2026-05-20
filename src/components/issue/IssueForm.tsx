import { useState } from "react";
import { IssueStatus, IssueType, type IssueDTO, type CreateIssueRequestDTO, type UpdateIssueRequestDTO } from "../../data/dto/issue";
import { useProject } from "../../context/project/useProject";
import Row from "../row";

interface IssueFormProps {
  initialData?: IssueDTO;
  onSubmit: (data: CreateIssueRequestDTO | UpdateIssueRequestDTO) => Promise<void>;
  onCancel: () => void;
  projectId: string;
  sprintId?: string | null;
}

export const IssueForm = ({ initialData, onSubmit, onCancel, projectId, sprintId }: IssueFormProps) => {
  const { currentProject } = useProject();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<IssueType>(initialData?.type || IssueType.TASK);
  const [status, setStatus] = useState<IssueStatus>(initialData?.status || IssueStatus.TODO);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(initialData?.assigneeId || undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      projectId,
      title,
      description,
      type,
      status,
      assigneeId,
      sprintId: sprintId || initialData?.sprintId,
    } as CreateIssueRequestDTO | UpdateIssueRequestDTO);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
          />
        </div>
        
        <Row style={{ gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Type d'issue</label>
            <select value={type} onChange={(e) => setType(e.target.value as IssueType)} style={selectStyle}>
              {Object.values(IssueType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>État</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus)} style={selectStyle}>
              {Object.values(IssueStatus).map(s => <option key={s} value={s}>{s}</option>)}
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
            {currentProject?.members?.map(m => (
              <option key={m.userId} value={m.userId}>
                {m.user?.firstName} {m.user?.lastName}
              </option>
            ))}
          </select>
        </div>

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
