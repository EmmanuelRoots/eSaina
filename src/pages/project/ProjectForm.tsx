import { useMemo, useState, type CSSProperties } from "react";
import { FolderKanban, Hash, Type, AlignLeft, Loader2 } from "lucide-react";
import { type CreateProjectRequestDTO } from "../../data/dto/project/index";
import projectApi from "../../services/api/project.api";
import ModalHeader from "../../components/modal/header";
import ModalBody from "../../components/modal/body";
import ModalFooter from "../../components/modal/footer";
import { useModalContext } from "../../context/modal";

interface ProjectFormProps {
  onSuccess: () => void;
}

// Same stable-color hashing logic used in ProjectList
const PROJECT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
const colorFor = (key: string) => {
  if (!key) return 'var(--color-text-tertiary)';
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PROJECT_COLORS[h % PROJECT_COLORS.length];
};

const labelStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  fontSize: 12, fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase', letterSpacing: 0.6,
  marginBottom: 6,
};

const baseInputStyle: CSSProperties = {
  width: '100%',
  height: 40,
  padding: '0 12px',
  fontSize: 14,
  fontFamily: 'var(--font-main)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
};

const focusRing = (color = 'var(--color-primary)') => ({
  borderColor: color,
  boxShadow: '0 0 0 3px var(--color-primary50)',
});

const ProjectForm = ({ onSuccess }: ProjectFormProps) => {
  const { onClose } = useModalContext();

  const [values, setValues] = useState<CreateProjectRequestDTO>({
    key: '',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectRequestDTO, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<keyof CreateProjectRequestDTO | null>(null);

  const previewColor = useMemo(() => colorFor(values.key), [values.key]);
  const previewKey = (values.key || '—').slice(0, 4).toUpperCase();
  const previewName = values.name.trim() || 'Nom du projet';

  const setField = <K extends keyof CreateProjectRequestDTO>(name: K, value: CreateProjectRequestDTO[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!values.key.trim()) next.key = 'La clé est requise.';
    else if (!/^[A-Z][A-Z0-9]{1,9}$/.test(values.key.trim()))
      next.key = '2 à 10 caractères, lettres majuscules ou chiffres, doit commencer par une lettre.';
    if (!values.name.trim()) next.name = 'Le nom est requis.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await projectApi.createProject({
        ...values,
        key: values.key.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      console.error('Erreur création projet:', err);
      setSubmitError('Impossible de créer le projet. Vérifiez la clé (doit être unique) puis réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyleFor = (name: keyof CreateProjectRequestDTO): CSSProperties => ({
    ...baseInputStyle,
    ...(focused === name ? focusRing(errors[name] ? 'var(--color-error)' : 'var(--color-primary)') : {}),
    ...(errors[name] && focused !== name ? { borderColor: 'var(--color-error)' } : {}),
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
      <ModalHeader
        icon={
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--color-primary50)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderKanban size={22} strokeWidth={2.2} />
          </div>
        }
      >
        Créer un nouveau projet
      </ModalHeader>

      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Live preview tile — mirrors the ProjectList card visual */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: 14,
            background: 'var(--color-surface2)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: previewColor, opacity: values.key ? 1 : 0.3 }} />
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: values.key ? previewColor : 'var(--color-border)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, letterSpacing: 0.4,
              boxShadow: values.key ? `0 4px 12px ${previewColor}40` : 'none',
              transition: 'background 200ms, box-shadow 200ms',
            }}>
              {previewKey}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: values.name ? 'var(--color-text)' : 'var(--color-text-tertiary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{previewName}</div>
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
                color: 'var(--color-text-tertiary)', marginTop: 2,
              }}>{values.key ? values.key.toUpperCase() : 'CLÉ'}</div>
            </div>
          </div>

          {/* Key + Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}><Hash size={12} /> Clé</label>
              <input
                value={values.key}
                onChange={(e) => setField('key', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onFocus={() => setFocused('key')}
                onBlur={() => setFocused(null)}
                placeholder="ESA"
                maxLength={10}
                autoFocus
                style={{ ...inputStyleFor('key'), fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 0.5 }}
              />
              {errors.key && (
                <div style={errorTextStyle}>{errors.key}</div>
              )}
            </div>
            <div>
              <label style={labelStyle}><Type size={12} /> Nom du projet</label>
              <input
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="eSaina"
                style={inputStyleFor('name')}
              />
              {errors.name && (
                <div style={errorTextStyle}>{errors.name}</div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}><AlignLeft size={12} /> Description <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>(optionnel)</span></label>
            <textarea
              value={values.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
              onFocus={() => setFocused('description')}
              onBlur={() => setFocused(null)}
              placeholder="À quoi sert ce projet ?"
              rows={3}
              style={{ ...inputStyleFor('description'), height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {submitError && (
            <div style={{
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(var(--color-error-rgb), 0.08)',
              border: '1px solid rgba(var(--color-error-rgb), 0.25)',
              color: 'var(--color-error)', fontSize: 13, fontWeight: 500,
            }}>{submitError}</div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={{
            height: 38, padding: '0 16px', borderRadius: 8,
            background: 'transparent', color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            fontSize: 13, fontWeight: 600,
          }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 38, padding: '0 18px', borderRadius: 8,
            background: 'var(--color-primary)', color: 'white',
            border: '1px solid var(--color-primary)',
            fontSize: 13, fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading && <Loader2 size={14} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Création…' : 'Créer le projet'}
        </button>
      </ModalFooter>
    </form>
  );
};

const errorTextStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 12, fontWeight: 500,
  color: 'var(--color-error)',
};

export default ProjectForm;
