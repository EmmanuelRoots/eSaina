import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../../context/project";
import Column from "../../components/column";
import Row from "../../components/row";
import { useThemeColors } from "../../hooks/theme";
import Button from "../../components/Button";
import { SectionLayout } from "../layout/section";

const Backlog = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { backlogIssues, sprints, fetchBacklog, fetchProjectData, currentProject } = useProject();
  const colors = useThemeColors();

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
      fetchBacklog(projectId);
    }
  }, [projectId]);

  return (
    <SectionLayout>
      <Column style={{ padding: "20px", gap: "20px" }}>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ color: colors.default }}>{currentProject?.name} - Backlog</h1>
          <Button onClick={() => {}}>Créer un Sprint</Button>
        </Row>

        {/* Sprints Section */}
        {sprints.map((sprint) => (
          <Column
            key={sprint.id}
            style={{
              background: "#f4f5f7",
              borderRadius: "8px",
              padding: "15px",
              gap: "10px",
            }}
          >
            <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>
                {sprint.name} ({sprint.issues.length} issues)
              </h3>
              <Row style={{ gap: "10px" }}>
                <span style={{ fontSize: "0.8em", color: "#666" }}>{sprint.status}</span>
                {sprint.status === "PLANNED" && <Button onClick={() => {}}>Lancer</Button>}
              </Row>
            </Row>
            <Column style={{ gap: "5px" }}>
              {sprint.issues.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    background: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    <span style={{ fontWeight: 600, marginRight: "10px" }}>{issue.key}</span>
                    {issue.title}
                  </span>
                  <span style={{ fontSize: "0.8em", color: "#666" }}>{issue.status}</span>
                </div>
              ))}
              {sprint.issues.length === 0 && (
                <div style={{ padding: "10px", color: "#888", textAlign: "center", border: "1px dashed #ccc" }}>
                  Faites glisser des issues ici
                </div>
              )}
            </Column>
          </Column>
        ))}

        {/* Backlog Section */}
        <Column style={{ gap: "10px" }}>
          <h3>Backlog ({backlogIssues.length} issues)</h3>
          <Column style={{ gap: "5px" }}>
            {backlogIssues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  background: "white",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <span style={{ fontWeight: 600, marginRight: "10px" }}>{issue.key}</span>
                  {issue.title}
                </span>
                <span style={{ fontSize: "0.8em", color: "#666" }}>{issue.type}</span>
              </div>
            ))}
            {backlogIssues.length === 0 && <div style={{ color: "#888" }}>Aucune issue dans le backlog</div>}
          </Column>
          <Button onClick={() => {}} style={{ width: "fit-content" }}>+ Créer une issue</Button>
        </Column>
      </Column>
    </SectionLayout>
  );
};

export default Backlog;
