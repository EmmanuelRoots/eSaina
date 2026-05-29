/**
 * Modal de gestion des statuts d'un projet (colonnes du board).
 *
 * Permet de créer, renommer, supprimer et **réorganiser par drag-and-drop**
 * les statuts. Le réordonnancement est persisté via `reorderStatuses` qui
 * appelle l'API backend, puis rafraîchit le projet pour que le board reflète
 * le nouvel ordre.
 *
 * Dépendances externes : @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
 */
import { useState } from "react";
import { X, GripVertical, Plus, Trash2, Edit2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProjectStatusDTO } from "../../data/dto/project";
import { useProject } from "../../context/project/useProject";

interface StatusManagementModalProps {
  projectId: string;
  onClose: () => void;
  /** Appelé après chaque drag-and-drop avec les IDs de statuts dans leur nouvel ordre. */
  onReorder?: (statusIds: string[]) => void;
}

// ─── Ligne de statut draggable ────────────────────────────────────────────────

interface SortableStatusRowProps {
  status: ProjectStatusDTO;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Ligne de statut avec poignée drag-and-drop et actions d'édition/suppression.
 *
 * @param status  - Le statut à afficher.
 * @param onUpdate - Callback pour renommer le statut.
 * @param onDelete - Callback pour supprimer le statut.
 */
const SortableStatusRow = ({ status, onUpdate, onDelete }: SortableStatusRowProps) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(status.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    background: "var(--color-surface)",
    cursor: isDragging ? "grabbing" : "default",
  };

  const handleRename = () => {
    if (name.trim() && name.trim() !== status.name) {
      onUpdate(status.id, name.trim());
    }
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Poignée de drag — seul élément qui déclenche le drag */}
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", color: "var(--color-text-tertiary)", display: "flex", touchAction: "none" }}
        title="Glisser pour réordonner"
      >
        <GripVertical size={16} />
      </span>

      <div style={{ width: 12, height: 12, borderRadius: "50%", background: status.color, flexShrink: 0 }} />

      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setName(status.name); setEditing(false); } }}
          style={{
            flex: 1, fontSize: 14, padding: "2px 6px",
            border: "1px solid var(--color-primary)", borderRadius: 4,
            background: "var(--color-surface)", color: "var(--color-text)",
          }}
        />
      ) : (
        <span style={{ flex: 1, fontSize: 14 }}>{status.name}</span>
      )}

      <button
        onClick={() => setEditing(true)}
        title="Renommer"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => onDelete(status.id)}
        title="Supprimer"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error)", display: "flex" }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// ─── Modal principal ──────────────────────────────────────────────────────────

/**
 * Modal de gestion des statuts : création, renommage, suppression et
 * réorganisation par drag-and-drop.
 *
 * @param projectId - L'identifiant du projet courant.
 * @param onClose   - Callback de fermeture du modal.
 */
export const StatusManagementModal = ({ projectId, onClose, onReorder }: StatusManagementModalProps) => {
  const { currentProject, createStatus, updateStatus, deleteStatus, reorderStatuses, fetchBoard } = useProject();
  const [newStatusName, setNewStatusName] = useState("");

  // Ordre local optimiste — mis à jour immédiatement avant la réponse API
  const [localStatuses, setLocalStatuses] = useState<ProjectStatusDTO[]>(
    () => currentProject?.statuses ?? []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  if (!currentProject) return null;

  const handleCreate = async () => {
    if (!newStatusName.trim()) return;
    try {
      const res = await createStatus(currentProject.id, { name: newStatusName, color: "#64748b" });
      if (res) setLocalStatuses((prev) => [...prev, res]);
      await fetchBoard(currentProject.id);
      setNewStatusName("");
    } catch (error) {
      console.error("Échec de la création du statut :", error);
    }
  };

  const handleUpdate = async (statusId: string, newName: string) => {
    try {
      const updated = await updateStatus(statusId, { name: newName });
      if (updated) {
        setLocalStatuses((prev) => prev.map((s) => (s.id === statusId ? { ...s, name: newName } : s)));
      }
    } catch (error) {
      console.error("Échec du renommage du statut :", error);
    }
  };

  const handleDelete = async (statusId: string) => {
    try {
      await deleteStatus(statusId);
      setLocalStatuses((prev) => prev.filter((s) => s.id !== statusId));
    } catch (error) {
      console.error("Échec de la suppression du statut :", error);
    }
  };

  /**
   * Applique le nouvel ordre après un drop : mise à jour locale optimiste
   * puis appel API pour persister.
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localStatuses.findIndex((s) => s.id === active.id);
    const newIndex = localStatuses.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localStatuses, oldIndex, newIndex);
    const reorderedIds = reordered.map((s) => s.id);

    setLocalStatuses(reordered);
    // Met à jour l'ordre des colonnes dans le board immédiatement (via localStorage)
    onReorder?.(reorderedIds);

    try {
      await reorderStatuses(projectId, reorderedIds);
    } catch (error) {
      // Rollback en cas d'échec API
      setLocalStatuses(localStatuses);
      onReorder?.(localStatuses.map((s) => s.id));
      console.error("Échec du réordonnancement :", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--color-surface)", borderRadius: 12,
        width: 420, padding: 24, boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", gap: 16, maxHeight: "80vh",
      }}>
        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Gestion des colonnes</h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>
              Glissez les lignes pour réorganiser l'ordre des colonnes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Création d'un nouveau statut */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            placeholder="Nouveau statut..."
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 6,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)", color: "var(--color-text)",
              fontSize: 14,
            }}
          />
          <button
            onClick={handleCreate}
            style={{
              padding: "8px 12px", borderRadius: 6,
              background: "var(--color-primary)", color: "white",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Liste triable */}
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localStatuses.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {localStatuses.map((status) => (
                <SortableStatusRow
                  key={status.id}
                  status={status}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>

          {localStatuses.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13, padding: "20px 0" }}>
              Aucun statut — créez-en un ci-dessus.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
