export type ChangeSignificance =
  "minor" | "normal" | "important" | "architectural";
export type NodeType =
  | "system"
  | "module"
  | "service"
  | "class"
  | "function"
  | "database"
  | "external-service"
  | "queue"
  | "api";
export type RelationshipType =
  | "depends-on"
  | "calls"
  | "reads-from"
  | "writes-to"
  | "publishes-to"
  | "consumes-from"
  | "contains"
  | "implements";
export type TaskStatus =
  "backlog" | "ready" | "in-progress" | "review" | "done";
export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  defaultBranch: string;
  updatedAt: string;
  componentCount: number;
  taskPrefix: string;
}
export interface Developer {
  id: string;
  name: string;
  username: string;
  role: string;
  primaryAreas: string[];
  initials: string;
  color: string;
  changes: number;
  bio: string;
}
export interface Evidence {
  source: string;
  revision: string;
  status: "recorded" | "inferred" | "confirmed";
}
export interface Change {
  id: string;
  title: string;
  summary: string;
  reason: string;
  implementation: string;
  type: "feature" | "fix" | "refactor" | "architecture" | "maintenance";
  significance: ChangeSignificance;
  authorId: string;
  timestamp: string;
  relativeTime: string;
  commitSha: string;
  pullRequestNumber: number;
  branch: string;
  componentIds: string[];
  files: string[];
  architectureBefore?: string;
  architectureAfter?: string;
  relatedTaskIds: string[];
  decisionId?: string;
  evidence: Evidence;
}
export interface ArchitectureNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  path?: string;
  responsibilities: string[];
  parentId?: string;
  systemId?: string;
  guarantees?: string[];
  decisionId?: string;
}
export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  description: string;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  labels: string[];
  componentIds: string[];
  relatedChangeIds: string[];
  milestoneId: string;
  dueDate?: string;
  acceptanceCriteria: string[];
  assumptions: string[];
  resources: string[];
  agentCreated?: boolean;
}
export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  deliverables: { title: string; complete: boolean }[];
}
export interface ArchitectureFlow {
  id: string;
  name: string;
  description: string;
  purpose: string;
  entryPoint: string;
  output: string;
  guarantees: string[];
  nodeIds: string[];
}
export interface Decision {
  id: string;
  title: string;
  date: string;
  context: string;
  decision: string;
  alternatives: { name: string; reason: string }[];
  componentIds: string[];
  status: string;
}
export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  type: "architecture" | "change" | "milestone";
}
export interface OverviewData {
  currentTaskIds: string[];
  suggestedComponentIds: string[];
  pipelineDescription: string;
  workSuggestions: { label: string; request: string }[];
  pipeline: {
    id: string;
    name: string;
    icon: "items" | "borrowing" | "pickup" | "returns" | "waitlists";
    line1: string;
    line2: string;
  }[];
  teamActivity: {
    changeId: string;
    action: string;
    detail: string;
    time: string;
  }[];
}
export interface Snapshot {
  project: Project;
  projects: { id: string; name: string; description: string }[];
  developers: Developer[];
  changes: Change[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  tasks: Task[];
  milestones: Milestone[];
  flows: ArchitectureFlow[];
  decisions: Decision[];
  notifications: Notification[];
  overview: OverviewData;
  knowledge: {
    schemaVersion: number;
    knowledgeRevision: string;
    recordedAt: string;
  };
}
export interface Overlap {
  task: Task;
  componentIds: string[];
  sharedResources: string[];
  level: "contract" | "files" | "component";
  explanation: string;
}
