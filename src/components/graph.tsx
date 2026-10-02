"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  GitBranch,
  Layers,
  Search,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from "./project-context";
import { DecisionDialog } from "./activity";
import { EmptyState, PageHeader, nodeIcons } from "./shared";
import { cn } from "@/lib/utils";
import type { ArchitectureNode, ArchitectureFlow, NodeType } from "@/types";
type ComponentNode = Node<
  {
    component: ArchitectureNode;
    childCount: number;
    step?: number;
    onExplore?: () => void;
  },
  "component"
>;
type RelationshipEdge = Edge<
  { description: string; relationship: string },
  "relationship"
>;
function GraphNode({ data, selected }: NodeProps<ComponentNode>) {
  const Icon = nodeIcons[data.component.type];
  return (
    <div
      className={cn(
        "graph-node",
        selected && "graph-node-selected",
        data.component.type === "system" && "system-node",
      )}
      onDoubleClick={(e) => {
        e.stopPropagation();
        data.onExplore?.();
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="graph-node-heading">
        <span className="graph-node-icon">
          <Icon />
        </span>
        <span className="graph-node-type">
          {data.step
            ? `Step ${String(data.step).padStart(2, "0")}`
            : data.component.type.replace("-", " ")}
        </span>
        {data.childCount > 0 && (
          <span className="node-child-count">{data.childCount}</span>
        )}
      </div>
      <strong>{data.component.name}</strong>
      <p>{data.component.description}</p>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function Relationship({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps<RelationshipEdge>) {
  const [hover, setHover] = useState(false);
  const [path, x, y] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 14,
  });
  return (
    <g onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: hover ? "#edaa83" : "#53555e",
          strokeWidth: hover ? 2 : 1.4,
        }}
      />
      <title>
        {data?.relationship}: {data?.description}
      </title>
      {hover && (
        <EdgeLabelRenderer>
          <div
            className="edge-tooltip"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
            }}
          >
            {data?.description}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}
const nodeTypes = { component: GraphNode };
const edgeTypes = { relationship: Relationship };
function FitControls() {
  const { fitView, getViewport } = useReactFlow();
  return (
    <div className="graph-fit-actions">
      <Button
        variant="outline"
        size="sm"
        onClick={() => fitView({ padding: 0.18, duration: 250 })}
      >
        Fit view
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const v = getViewport();
          fitView({
            padding: 0.18,
            minZoom: v.zoom,
            maxZoom: v.zoom,
            duration: 250,
          });
        }}
      >
        Center
      </Button>
    </div>
  );
}
export function CodebasePage() {
  return (
    <ReactFlowProvider>
      <CodebaseContent />
    </ReactFlowProvider>
  );
}
function CodebaseContent() {
  const { data } = useProject();
  const params = useSearchParams();
  const [depth, setDepth] = useState("architecture");
  const [scope, setScope] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [types, setTypes] = useState<string[]>([
    "system",
    "module",
    "service",
    "class",
    "database",
    "external-service",
    "queue",
    "api",
  ]);
  const { fitView, setNodes } = useReactFlow();
  useEffect(() => {
    const id = params.get("node");
    const n = data.nodes.find((n) => n.id === id);
    if (n) {
      setSelected(n.id);
      setFocusId(n.id);
      setScope(null);
      setDepth(
        n.type === "system"
          ? "architecture"
          : n.type === "module"
            ? "modules"
            : "implementation",
      );
      if (n.type === "function")
        setTypes((t) => Array.from(new Set([...t, "function"])));
    }
  }, [params, data.nodes]);
  const getAncestors = useCallback(
    (id: string): ArchitectureNode[] => {
      const result: ArchitectureNode[] = [];
      let n = data.nodes.find((n) => n.id === id);
      while (n) {
        result.unshift(n);
        n = data.nodes.find((p) => p.id === n!.parentId);
      }
      return result;
    },
    [data.nodes],
  );
  const scopeNode = data.nodes.find((n) => n.id === scope);
  const drill = useCallback(
    (id: string) => {
      setFocusId(null);
      const n = data.nodes.find((n) => n.id === id);
      if (!n) return;
      const children = data.nodes.filter((c) => c.parentId === id);
      setSelected(id);
      if (children.length) {
        setScope(id);
        setDepth(n.type === "system" ? "modules" : "implementation");
        if (children.some((c) => c.type === "function"))
          setTypes((t) => Array.from(new Set([...t, "function"])));
      }
    },
    [data.nodes],
  );
  const visible = useMemo(
    () =>
      data.nodes.filter((n) => {
        if (!types.includes(n.type)) return false;
        if (scope) {
          const isDescendant =
            getAncestors(n.id).some((a) => a.id === scope) && n.id !== scope;
          const inSystem = scopeNode?.type === "system" && n.systemId === scope;
          return (
            (isDescendant || inSystem) &&
            (depth === "modules"
              ? n.type === "module"
              : !["system", "module"].includes(n.type))
          );
        }
        return depth === "architecture"
          ? n.type === "system"
          : depth === "modules"
            ? n.type === "module"
            : !["system", "module"].includes(n.type);
      }),
    [data.nodes, types, scope, scopeNode, depth, getAncestors],
  );
  const visibleIds = new Set(visible.map((n) => n.id));
  const flowNodes = useMemo<ComponentNode[]>(
    () =>
      visible.map((n, i) => ({
        id: n.id,
        type: "component",
        position:
          depth === "architecture"
            ? ([
                { x: 0, y: 0 },
                { x: 285, y: 0 },
                { x: 570, y: 0 },
                { x: 570, y: 190 },
                { x: 285, y: 190 },
                { x: 285, y: 380 },
                { x: 0, y: 380 },
                { x: 0, y: 190 },
              ][i] ?? { x: 0, y: 0 })
            : { x: (i % 3) * 285, y: Math.floor(i / 3) * 170 },
        data: {
          component: n,
          childCount: data.nodes.filter((c) => c.parentId === n.id).length,
          onExplore: () => drill(n.id),
        },
      })),
    [visible, depth, data.nodes, drill],
  );
  const flowEdges: RelationshipEdge[] = data.edges
    .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "relationship",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#53555e",
        width: 15,
        height: 15,
      },
      data: { description: e.description, relationship: e.type },
    }));
  const graphKey = `${depth}:${scope}:${types.join(":")}`;
  useEffect(() => {
    const timer = setTimeout(
      () => fitView({ padding: 0.18, duration: 0 }),
      100,
    );
    return () => clearTimeout(timer);
  }, [graphKey, fitView]);
  useEffect(() => {
    if (!focusId) return;
    const timer = setTimeout(() => {
      setNodes((current) =>
        current.map((node) => ({ ...node, selected: node.id === focusId })),
      );
      fitView({
        nodes: [{ id: focusId }],
        padding: 0.65,
        minZoom: 1,
        maxZoom: 1.15,
        duration: 200,
      });
      setFocusId(null);
    }, 180);
    return () => clearTimeout(timer);
  }, [focusId, graphKey, fitView, setNodes]);

  const focus = (id: string) => {
    const n = data.nodes.find((n) => n.id === id);
    if (!n) return;
    setScope(null);
    setSelected(id);
    setFocusId(id);
    setDepth(
      n.type === "system"
        ? "architecture"
        : n.type === "module"
          ? "modules"
          : "implementation",
    );
    setTypes((t) => Array.from(new Set([...t, n.type])));
    setQuery("");
  };
  const searchResults = query.trim()
    ? data.nodes
        .filter((n) =>
          `${n.name} ${n.description} ${n.path ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 7)
    : [];
  return (
    <div className="page-content graph-page">
      <PageHeader
        title="Codebase"
        description="Start with the system. Follow the connections. Understand the details."
      />
      <div className="graph-toolbar">
        <div className="component-search">
          <label className="search-field">
            <Search />
            <input
              aria-label="Search components"
              placeholder="Search components…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {query && (
            <div className="component-search-results">
              {searchResults.length ? (
                searchResults.map((n) => (
                  <button key={n.id} onClick={() => focus(n.id)}>
                    <span>{n.name}</span>
                    <small>{n.type}</small>
                    <ArrowRight />
                  </button>
                ))
              ) : (
                <p>No components found</p>
              )}
            </div>
          )}
        </div>
        <ToggleGroup
          className="depth-tabs"
          type="single"
          value={depth}
          onValueChange={(v) => {
            if (v) {
              setDepth(v);
              setScope(null);
            }
          }}
        >
          <ToggleGroupItem value="architecture">Architecture</ToggleGroupItem>
          <ToggleGroupItem value="modules">Modules</ToggleGroupItem>
          <ToggleGroupItem value="implementation">
            Implementation
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="graph-filter-row">
        <span>Show</span>
        <ToggleGroup
          type="multiple"
          value={types}
          onValueChange={setTypes}
          className="node-type-filters"
        >
          {[
            { value: "system", label: "Systems" },
            { value: "module", label: "Modules" },
            { value: "service", label: "Services" },
            { value: "class", label: "Classes" },
            { value: "function", label: "Functions" },
            { value: "database", label: "Data stores" },
            { value: "external-service", label: "External" },
            { value: "queue", label: "Queues" },
            { value: "api", label: "APIs" },
          ].map((t) => (
            <ToggleGroupItem key={t.value} value={t.value}>
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="graph-workspace">
        <div className="graph-canvas">
          <div className="graph-breadcrumb">
            <button
              onClick={() => {
                setScope(null);
                setDepth("architecture");
                setSelected(null);
              }}
            >
              <Layers />
              All systems
            </button>
            {scope &&
              getAncestors(scope).map((n) => (
                <span key={n.id}>
                  <ChevronRight />
                  <button onClick={() => drill(n.id)}>{n.name}</button>
                </span>
              ))}
            <small>{visible.length} components</small>
          </div>
          {visible.length ? (
            <ReactFlow
              key={graphKey}
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={(_, n) => setSelected(n.id)}
              onNodeDoubleClick={(_, n) => drill(n.id)}
              zoomOnDoubleClick={false}
              fitView
              fitViewOptions={{ padding: 0.18 }}
              minZoom={0.35}
              maxZoom={1.6}
              colorMode="dark"
              nodesDraggable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                color="#33353a"
                gap={22}
                size={1}
              />
              <Controls showInteractive={false} />
              <FitControls />
            </ReactFlow>
          ) : (
            <EmptyState
              title="No components in this view"
              description="Enable a node type or choose another depth."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setTypes([
                      "system",
                      "module",
                      "service",
                      "class",
                      "database",
                      "external-service",
                      "queue",
                      "api",
                    ]);
                    setScope(null);
                    setDepth("architecture");
                  }}
                >
                  Reset view
                </Button>
              }
            />
          )}
          <div className="graph-canvas-caption">
            <span className="green-dot" />
            Knowledge at <code>{data.knowledge.knowledgeRevision}</code>
            <span>Click to inspect · Double-click to explore</span>
          </div>
        </div>
        <NodeInspector
          id={selected}
          onSelect={focus}
          onDrill={drill}
          onClose={() => setSelected(null)}
        />
      </div>
    </div>
  );
}
function NodeInspector({
  id,
  onSelect,
  onDrill,
  onClose,
}: {
  id: string | null;
  onSelect: (id: string) => void;
  onDrill?: (id: string) => void;
  onClose: () => void;
}) {
  const { data } = useProject();
  const node = data.nodes.find((n) => n.id === id);
  const [decision, setDecision] = useState<string | null>(null);
  if (!node)
    return (
      <aside className="node-inspector inspector-empty">
        <div className="inspector-placeholder">
          <BoxPlaceholder />
          <h2>A shared map of your system</h2>
          <p>
            Select a component to understand its purpose, dependencies,
            decisions, and recent changes.
          </p>
          <div>
            <span>
              <Check />
              Responsibilities and guarantees
            </span>
            <span>
              <GitBranch />
              Changes with source context
            </span>
            <span>
              <BookOpen />
              Decisions and alternatives
            </span>
          </div>
        </div>
      </aside>
    );
  const Icon = nodeIcons[node.type];
  const dependencies = data.edges.filter((e) => e.source === id);
  const usedBy = data.edges.filter((e) => e.target === id);
  const children = data.nodes.filter((n) => n.parentId === id);
  const recent = data.changes.filter((c) => c.componentIds.includes(id!));
  return (
    <aside className="node-inspector">
      <div className="inspector-heading">
        <span className="change-icon peach">
          <Icon />
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close component details"
          onClick={onClose}
        >
          <X />
        </Button>
        <Badge variant="outline">{node.type}</Badge>
        <h2>{node.name}</h2>
        <p>{node.description}</p>
      </div>
      {node.path && (
        <section>
          <h3 className="detail-label">Location</h3>
          <code className="node-path">{node.path}</code>
        </section>
      )}
      <section>
        <h3 className="detail-label">Responsibilities</h3>
        <ul className="plain-list">
          {node.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      {node.guarantees && (
        <section>
          <h3 className="detail-label">Important guarantees</h3>
          <ul className="guarantee-list">
            {node.guarantees.map((g) => (
              <li key={g}>
                <ShieldCheck />
                {g}
              </li>
            ))}
          </ul>
        </section>
      )}
      {children.length > 0 && (
        <section>
          <h3 className="detail-label">Contains</h3>
          {children.map((n) => (
            <button
              className="inspector-link"
              onClick={() => onSelect(n.id)}
              key={n.id}
            >
              {n.name}
              <ChevronRight />
            </button>
          ))}
          {onDrill && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDrill(node.id)}
            >
              Explore{" "}
              {node.type === "system"
                ? "modules"
                : node.type === "module"
                  ? "implementation"
                  : "functions"}
              <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </section>
      )}
      {dependencies.length > 0 && (
        <section>
          <h3 className="detail-label">Depends on · outgoing</h3>
          {dependencies.map((e) => (
            <button
              className="inspector-link"
              key={e.id}
              onClick={() => onSelect(e.target)}
              title={e.description}
            >
              <span>
                {data.nodes.find((n) => n.id === e.target)?.name}
                <small>{e.type}</small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </section>
      )}
      {usedBy.length > 0 && (
        <section>
          <h3 className="detail-label">Used by · incoming</h3>
          {usedBy.map((e) => (
            <button
              className="inspector-link"
              key={e.id}
              onClick={() => onSelect(e.source)}
              title={e.description}
            >
              {data.nodes.find((n) => n.id === e.source)?.name}
              <ChevronRight />
            </button>
          ))}
        </section>
      )}
      {node.decisionId && (
        <section>
          <h3 className="detail-label">Decision memory</h3>
          <button
            className="decision-link"
            onClick={() => setDecision(node.decisionId!)}
          >
            <BookOpen />
            <span>
              {data.decisions.find((d) => d.id === node.decisionId)?.title}
            </span>
            <ChevronRight />
          </button>
        </section>
      )}
      {recent.length > 0 && (
        <section>
          <h3 className="detail-label">Recent changes</h3>
          {recent.map((c) => (
            <Link
              className="inspector-change"
              href={`/activity/${c.id}`}
              key={c.id}
            >
              <small>{c.relativeTime}</small>
              <span>{c.title}</span>
              <ArrowRight />
            </Link>
          ))}
        </section>
      )}
      <div className="inspector-footer">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/activity?component=${node.id}`}>
            <GitBranch data-icon="inline-start" />
            View activity
          </Link>
        </Button>
        {node.path && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={`${data.project.repositoryUrl}/blob/main/${node.path}`}
              target="_blank"
              rel="noreferrer"
            >
              <Code2 data-icon="inline-start" />
              View source
            </a>
          </Button>
        )}
      </div>
      <DecisionDialog
        id={decision}
        onOpenChange={(open) => !open && setDecision(null)}
      />
    </aside>
  );
}
function BoxPlaceholder() {
  return <Layers className="inspector-placeholder-icon" />;
}
export function ArchitecturePage() {
  const { data } = useProject();
  const params = useSearchParams();
  const flowParam = params.get("flow");
  const [flowId, setFlowId] = useState(flowParam ?? data.flows[0].id);
  useEffect(() => {
    if (flowParam) setFlowId(flowParam);
  }, [flowParam]);
  const [selected, setSelected] = useState<string | null>(null);
  const flow = data.flows.find((f) => f.id === flowId) ?? data.flows[0];
  return (
    <div className="page-content architecture-page">
      <PageHeader
        title="Architecture"
        description="How requests, data, and decisions move through Borrow."
      />
      <div className="flow-selector-grid">
        {data.flows.map((f) => (
          <button
            className={cn("flow-selector", flow.id === f.id && "selected")}
            key={f.id}
            onClick={() => {
              setFlowId(f.id);
              setSelected(null);
            }}
          >
            <Workflow />
            <strong>{f.name}</strong>
            <small>{f.description}</small>
            {flow.id === f.id && <span className="flow-selected-dot" />}
          </button>
        ))}
      </div>
      <div className="architecture-workspace">
        <div className="architecture-flow-panel">
          <div className="section-header">
            <h2>{flow.name}</h2>
            <Badge variant="outline">{flow.nodeIds.length} steps</Badge>
          </div>
          <ReactFlowProvider>
            <FlowCanvas
              flow={flow}
              selected={selected}
              onSelect={setSelected}
            />
          </ReactFlowProvider>
        </div>
        {selected ? (
          <NodeInspector
            id={selected}
            onSelect={setSelected}
            onClose={() => setSelected(null)}
          />
        ) : (
          <aside className="flow-description">
            <h2>{flow.name}</h2>
            <section>
              <h3 className="detail-label">Purpose</h3>
              <p>{flow.purpose}</p>
            </section>
            <section>
              <h3 className="detail-label">Entry point</h3>
              <code>{flow.entryPoint}</code>
            </section>
            <section>
              <h3 className="detail-label">Output</h3>
              <p>{flow.output}</p>
            </section>
            <section>
              <h3 className="detail-label">Important guarantees</h3>
              <ul className="guarantee-list">
                {flow.guarantees.map((g) => (
                  <li key={g}>
                    <ShieldCheck />
                    {g}
                  </li>
                ))}
              </ul>
            </section>
            <div className="flow-description-footer">
              <Check />
              Source-linked project knowledge
              <small>
                Updated at revision {data.knowledge.knowledgeRevision}
              </small>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
function FlowCanvas({
  flow,
  selected,
  onSelect,
}: {
  flow: ArchitectureFlow;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const { data } = useProject();
  const flowNodes: ComponentNode[] = flow.nodeIds.map((id, i) => ({
    id,
    type: "component",
    position: { x: (i % 3) * 270, y: Math.floor(i / 3) * 165 },
    selected: selected === id,
    data: {
      component: data.nodes.find((n) => n.id === id)!,
      childCount: 0,
      step: i + 1,
    },
  }));
  const flowEdges: RelationshipEdge[] = flow.nodeIds.slice(1).map((id, i) => ({
    id: `flow-${i}`,
    source: flow.nodeIds[i],
    target: id,
    type: "relationship",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#53555e" },
    data: {
      description: `${data.nodes.find((n) => n.id === flow.nodeIds[i])?.name} → ${data.nodes.find((n) => n.id === id)?.name}`,
      relationship: "flow",
    },
  }));
  return (
    <div className="flow-canvas">
      <ReactFlow
        key={flow.id}
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, n) => onSelect(n.id)}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.3}
        maxZoom={1.5}
        colorMode="dark"
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#33353a" gap={22} />
        <Controls showInteractive={false} />
        <FitControls />
      </ReactFlow>
    </div>
  );
}
