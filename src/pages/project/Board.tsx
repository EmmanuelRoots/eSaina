import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../../context/project";
import { IssueStatus } from "../../data/dto/issue";
import Column from "../../components/column";
import Row from "../../components/row";
import { Card, CardBody } from "../../components/card";
import { useThemeColors } from "../../hooks/theme";
import { SectionLayout } from "../layout/section";

const COLUMNS = [
  { status: IssueStatus.TODO, label: "À faire" },
  { status: IssueStatus.IN_PROGRESS, label: "En cours" },
  { status: IssueStatus.IN_REVIEW, label: "En révision" },
  { status: IssueStatus.DONE, label: "Terminé" },
];

const Board = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { boardIssues, fetchBoard, fetchProjectData, currentProject } = useProject();
  const colors = useThemeColors();

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
      fetchBoard(projectId);
    }
  }, [projectId]);

  return (
    <SectionLayout>
      <Column style={{ padding: "20px", height: "calc(100vh - 100px)" }}>
        <h1 style={{ marginBottom: "20px", color: colors.default }}>
          {currentProject?.name} - Tableau
        </h1>
        <Row style={{ gap: "20px", flex: 1, overflowX: "auto", alignItems: "flex-start" }}>
          {COLUMNS.map((col) => (
            <Column
              key={col.status}
              style={{
                background: colors.secondaryBackground || "#f4f5f7",
                borderRadius: "8px",
                width: "300px",
                minWidth: "300px",
                padding: "10px",
                height: "100%",
                gap: "10px",
              }}
            >
              <h3 style={{ padding: "5px 10px" }}>{col.label}</h3>
              <Column style={{ gap: "10px", overflowY: "auto" }}>
                {(boardIssues[col.status] || []).map((issue) => (
                  <Card key={issue.id} style={{ padding: "0" }}>
                    <CardBody>
                      <div style={{ fontSize: "0.8em", color: "#666", marginBottom: "5px" }}>
                        {issue.key}
                      </div>
                      <div style={{ fontWeight: 500 }}>{issue.title}</div>
                      <Row style={{ marginTop: "10px", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.7em", background: "#eee", padding: "2px 5px", borderRadius: "3px" }}>
                          {issue.type}
                        </span>
                        {issue.assignee && (
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: colors.primary,
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.6em",
                            }}
                            title={issue.assignee.firstName}
                          >
                            {issue.assignee.firstName?.[0]}
                          </div>
                        )}
                      </Row>
                    </CardBody>
                  </Card>
                ))}
              </Column>
            </Column>
          ))}
        </Row>
      </Column>
    </SectionLayout>
  );
};

export default Board;
