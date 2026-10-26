"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  useNodesInitialized,
  getNodesBounds,
  type Node,
  type NodeProps,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Layers,
  Search,
  X,
  ShieldCheck,
  ChevronRight,
  Workflow,
  Plus,
  Minus,
  Maximize,
  LocateFixed,
  Check,
} from "lucide-react";
import { useProject } from "@/components/project-context";
import {
  PageHeading,
  nodeIcons,
  ExternalLink,
  EmptyState,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  defaultTypes,
  typeLabels,
  nodeDepth,
  visibleNodes,
  nodePosition,
  isDescendant,
  type Depth,
} from "@/lib/graph";
import type { ArchitectureNode, ArchitectureFlow, NodeType } from "@/types";

type CardData = {
  record: ArchitectureNode;
  childrenCount: number;
  step?: number;
  select: (id: string) => void;
  explore?: (id: string) => void;
  [key: string]: unknown;
};
type ComponentNode = Node<CardData, "component">;
function ComponentCard({ data, selected }: NodeProps<ComponentNode>) {
  const Icon = nodeIcons[data.record.type];
  return (
    <div className={`component-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <button
        aria-label={`Inspect ${data.record.name}`}
        onClick={() => data.select(data.record.id)}
        onDoubleClick={() => data.explore?.(data.record.id)}
      >
        <div className="node-meta">
          <Icon size={18} />
          <span>
            {data.step
              ? `Step ${String(data.step).padStart(2, "0")}`
              : data.record.type.replace("-", " ")}
          </span>
          {data.childrenCount > 0 && (
            <span className="node-child-count">{data.childrenCount}</span>
          )}
        </div>
        <strong>{data.record.name}</strong>
        <p>{data.record.description}</p>
      </button>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
const nodeTypes = { component: ComponentCard };
function duration() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 250;
}
function ViewportTools({
  focusId,
  viewKey,
  architecture = false,
}: {
  focusId: string | null;
  viewKey: string;
  architecture?: boolean;
}) {
  const flow = useReactFlow<ComponentNode>(),
    initialized = useNodesInitialized();
  useEffect(() => {
    if (!initialized) return;
    const frame = requestAnimationFrame(() => {
      if (focusId && flow.getNode(focusId))
        void flow.fitView({
          nodes: [{ id: focusId }],
          padding: 0.6,
          minZoom: 0.8,
          maxZoom: 1.1,
          duration: duration(),
        });
      else
        void flow.fitView({
          padding: architecture ? 0.12 : 0.18,
          duration: duration(),
        });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialized, focusId, viewKey, flow, architecture]);
  return (
    <div className="graph-controls" aria-label="Graph controls">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Zoom in"
        onClick={() => void flow.zoomIn({ duration: duration() })}
      >
        <Plus />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Zoom out"
        onClick={() => void flow.zoomOut({ duration: duration() })}
      >
        <Minus />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Fit view"
        onClick={() =>
          void flow.fitView({
            padding: architecture ? 0.12 : 0.18,
            duration: duration(),
          })
        }
      >
        <Maximize />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Center"
        onClick={() => {
          const b = getNodesBounds(flow.getNodes());
          void flow.setCenter(b.x + b.width / 2, b.y + b.height / 2, {
            zoom: flow.getZoom(),
            duration: duration(),
          });
        }}
      >
        <LocateFixed />
      </Button>
    </div>
  );
}
function Canvas({
  nodes,
  edges,
  selected,
  viewKey,
  architecture = false,
  children,
}: {
  nodes: ComponentNode[];
  edges: Edge[];
  selected: string | null;
  viewKey: string;
  architecture?: boolean;
  children?: React.ReactNode;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const rendered = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smoothstep",
        pathOptions: { borderRadius: 14 },
        style: {
          stroke: hover === e.id ? "#edaa83" : "#53555e",
          strokeWidth: hover === e.id ? 2 : 1.4,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: hover === e.id ? "#edaa83" : "#53555e",
        },
      })),
    [edges, hover],
  );
  return (
    <div
      className={`graph-canvas ${architecture ? "architecture-canvas" : ""}`}
    >
      <ReactFlowProvider>
        <ReactFlow<ComponentNode>
          nodes={nodes}
          edges={rendered}
          nodeTypes={nodeTypes}
          deleteKeyCode={null}
          edgesReconnectable={false}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable
          zoomOnDoubleClick={false}
          minZoom={architecture ? 0.3 : 0.35}
          maxZoom={architecture ? 1.5 : 1.6}
          fitView
          fitViewOptions={{ padding: architecture ? 0.12 : 0.18 }}
          onEdgeMouseEnter={(_, e) => setHover(e.id)}
          onEdgeMouseLeave={() => setHover(null)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#33353a"
            gap={22}
            size={1}
          />
          <ViewportTools
            focusId={selected}
            viewKey={viewKey}
            architecture={architecture}
          />
        </ReactFlow>
      </ReactFlowProvider>
      {children}
      {hover && (
        <div className="relationship-tooltip" role="tooltip">
          {edges.find((e) => e.id === hover)?.data?.description as string}
        </div>
      )}
    </div>
  );
}
export function ComponentInspector({
  node,
  onSelect,
  onExplore,
  onClose,
}: {
  node: ArchitectureNode | null;
  onSelect: (id: string) => void;
  onExplore?: (id: string) => void;
  onClose: () => void;
}) {
  const { seed, setDecisionId } = useProject();
  if (!node)
    return (
      <aside className="component-inspector inspector-empty">
        <Layers size={34} />
        <h2>A shared map of your system</h2>
        <p>
          Select a component to understand its purpose, dependencies, decisions,
          and changes.
        </p>
        <ul>
          {[
            "Responsibilities and guarantees",
            "Changes with source context",
            "Decisions and alternatives",
          ].map((t) => (
            <li key={t}>
              <Check size={14} />
              {t}
            </li>
          ))}
        </ul>
      </aside>
    );
  const Icon = nodeIcons[node.type],
    children = seed.nodes.filter((n) => n.parentId === node.id),
    outgoing = seed.edges.filter((e) => e.source === node.id),
    incoming = seed.edges.filter((e) => e.target === node.id),
    decision = seed.decisions.find((d) => d.id === node.decisionId),
    changes = seed.changes.filter((c) => c.componentIds.includes(node.id));
  function nodeLink(id: string, detail?: string) {
    const target = seed.nodes.find((n) => n.id === id)!;
    const TargetIcon = nodeIcons[target.type];
    return (
      <button
        className="inspector-node-link"
        key={id}
        onClick={() => onSelect(id)}
      >
        <TargetIcon size={13} />
        <span>{target.name}</span>
        {detail ? <small>{detail}</small> : <ChevronRight size={12} />}
      </button>
    );
  }
  return (
    <aside className="component-inspector" aria-label={`${node.name} details`}>
      <header>
        <Icon size={23} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close inspector"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </header>
      <Badge variant="secondary">{node.type.replace("-", " ")}</Badge>
      <h2>{node.name}</h2>
      <p className="inspector-description">{node.description}</p>
      {node.path && (
        <section>
          <h3>Location</h3>
          <code className="source-path">{node.path}</code>
        </section>
      )}
      <section>
        <h3>Responsibilities</h3>
        <ul>
          {node.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      {node.guarantees?.length && (
        <section>
          <h3>Important guarantees</h3>
          <ul className="guarantees">
            {node.guarantees.map((g) => (
              <li key={g}>
                <ShieldCheck size={14} />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {children.length > 0 && (
        <section>
          <h3>Contains</h3>
          {children.map((n) => nodeLink(n.id))}
          {onExplore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExplore(node.id)}
            >
              Explore{" "}
              {node.type === "system"
                ? "modules"
                : node.type === "module"
                  ? "implementation"
                  : "functions"}
              <ChevronRight size={12} />
            </Button>
          )}
        </section>
      )}
      {outgoing.length > 0 && (
        <section>
          <h3>Depends on · outgoing</h3>
          {outgoing.map((e) => (
            <Tooltip key={e.id}>
              <TooltipTrigger asChild>
                {nodeLink(e.target, e.type)}
              </TooltipTrigger>
              <TooltipContent>{e.description}</TooltipContent>
            </Tooltip>
          ))}
        </section>
      )}
      {incoming.length > 0 && (
        <section>
          <h3>Used by · incoming</h3>
          {incoming.map((e) => (
            <Tooltip key={e.id}>
              <TooltipTrigger asChild>
                {nodeLink(e.source, e.type)}
              </TooltipTrigger>
              <TooltipContent>{e.description}</TooltipContent>
            </Tooltip>
          ))}
        </section>
      )}
      {decision && (
        <section>
          <h3>Decision memory</h3>
          <button
            className="decision-link"
            onClick={() => setDecisionId(decision.id)}
          >
            <ShieldCheck size={15} />
            <span>
              <code>{decision.id.toUpperCase()}</code>
              {decision.title}
            </span>
            <ChevronRight size={13} />
          </button>
        </section>
      )}
      {changes.length > 0 && (
        <section>
          <h3>Recent changes</h3>
          {changes.map((c) => (
            <Link
              className="inspector-change"
              href={`/activity/${c.id}`}
              key={c.id}
            >
              <span>{c.title}</span>
              <small>{c.relativeTime}</small>
            </Link>
          ))}
        </section>
      )}
      <footer>
        <Link href={`/activity?component=${node.id}`}>
          View activity <ChevronRight size={12} />
        </Link>
        {node.path && (
          <ExternalLink
            href={`${seed.project.repositoryUrl}/blob/${seed.project.defaultBranch}/${node.path}`}
          >
            View source
          </ExternalLink>
        )}
      </footer>
    </aside>
  );
}
export function Codebase() {
  const { seed } = useProject(),
    params = useSearchParams();
  const initial = seed.nodes.find((n) => n.id === params.get("node"));
  const [depth, setDepth] = useState<Depth>(
      initial ? nodeDepth(initial) : "architecture",
    ),
    [scope, setScope] = useState<string | null>(
      initial &&
        params.get("scope") &&
        isDescendant(initial, params.get("scope")!, seed.nodes)
        ? params.get("scope")
        : null,
    ),
    [focus, setFocus] = useState<string | null>(initial?.id ?? null),
    [selected, setSelected] = useState<string | null>(initial?.id ?? null),
    [types, setTypes] = useState<NodeType[]>(
      initial?.type === "function"
        ? [...defaultTypes, "function"]
        : defaultTypes,
    ),
    [query, setQuery] = useState("");
  const nodes = visibleNodes(seed.nodes, depth, scope, types),
    selection = seed.nodes.find((n) => n.id === selected) ?? null;
  function select(id: string) {
    const n = seed.nodes.find((n) => n.id === id);
    if (!n) return;
    setSelected(id);
    setFocus(id);
    setDepth(nodeDepth(n));
    setTypes((t) => (t.includes(n.type) ? t : [...t, n.type]));
    if (!nodes.some((n) => n.id === id)) setScope(null);
    setQuery("");
  }
  function explore(id: string) {
    const n = seed.nodes.find((n) => n.id === id);
    if (!n || !seed.nodes.some((c) => c.parentId === id)) return;
    setScope(id);
    setFocus(null);
    setDepth(n.type === "system" ? "modules" : "implementation");
    setSelected(null);
    setTypes((t) => [
      ...new Set([
        ...t,
        ...seed.nodes.filter((c) => c.parentId === id).map((c) => c.type),
      ]),
    ]);
  }
  function reset() {
    setFocus(null);
    setDepth("architecture");
    setScope(null);
    setSelected(null);
    setTypes(defaultTypes);
    setQuery("");
  }
  const graphNodes: ComponentNode[] = nodes.map((n, i) => ({
    id: n.id,
    type: "component",
    // Explicit dimensions keep React Flow from hiding a node while remeasuring
    // selection updates, which would swallow the second click of a double-click.
    width: 205,
    height: 116,
    position: nodePosition(n, i, depth),
    selected: n.id === selected,
    data: {
      record: n,
      childrenCount: seed.nodes.filter((c) => c.parentId === n.id).length,
      select: setSelected,
      explore,
    },
  }));
  const graphEdges: Edge[] = seed.edges
    .filter(
      (e) =>
        nodes.some((n) => n.id === e.source) &&
        nodes.some((n) => n.id === e.target),
    )
    .map((e) => ({
      ...e,
      data: { description: e.description },
      ariaLabel: e.description,
    }));
  const suggestions = query.trim()
    ? seed.nodes
        .filter((n) =>
          `${n.name} ${n.description} ${n.path ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 7)
    : [];
  const crumbs: ArchitectureNode[] = [];
  let ancestor = seed.nodes.find((n) => n.id === scope);
  while (ancestor) {
    crumbs.unshift(ancestor);
    ancestor = seed.nodes.find((n) => n.id === ancestor?.parentId);
  }
  return (
    <>
      <PageHeading
        title="Codebase"
        description="Start with the system. Follow the connections. Understand the details."
      />
      <div className="graph-toolbar">
        <div className="component-search">
          <div className="search-field">
            <Search size={16} />
            <Input
              aria-label="Search components"
              placeholder="Search components…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions[0]) {
                  setScope(null);
                  select(suggestions[0].id);
                }
                if (e.key === "Escape") setQuery("");
              }}
            />
          </div>
          {query && (
            <div className="component-suggestions">
              {suggestions.length ? (
                suggestions.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setScope(null);
                      select(n.id);
                    }}
                  >
                    <strong>{n.name}</strong>
                    <small>{n.path ?? n.description}</small>
                  </button>
                ))
              ) : (
                <p>No matching components</p>
              )}
            </div>
          )}
        </div>
        <div className="depth-selector" aria-label="Graph depth">
          {(["architecture", "modules", "implementation"] as const).map((d) => (
            <button
              key={d}
              aria-pressed={depth === d}
              onClick={() => {
                setDepth(d);
                setFocus(null);
                setScope(null);
                setSelected(null);
              }}
            >
              {d[0].toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="type-filters">
        <span>Show</span>
        {(Object.keys(typeLabels) as NodeType[]).map((type) => (
          <button
            key={type}
            aria-pressed={types.includes(type)}
            onClick={() =>
              setTypes((t) =>
                t.includes(type) ? t.filter((x) => x !== type) : [...t, type],
              )
            }
          >
            <span className="filter-check">
              {types.includes(type) && <Check size={10} />}
            </span>
            {typeLabels[type]}
          </button>
        ))}
      </div>
      <div className="graph-workspace">
        <div className="graph-main">
          {nodes.length ? (
            <Canvas
              nodes={graphNodes}
              edges={graphEdges}
              selected={focus}
              viewKey={`${depth}:${scope}:${types.join(",")}`}
            >
              <div className="graph-breadcrumbs">
                <button onClick={reset}>All systems</button>
                {crumbs.map((n) => (
                  <span key={n.id}>
                    <ChevronRight size={12} />
                    <button onClick={() => explore(n.id)}>{n.name}</button>
                  </span>
                ))}
                <small>{nodes.length} components</small>
              </div>
              <div className="knowledge-caption">
                <span>
                  <i />
                  Knowledge at <code>{seed.knowledge.knowledgeRevision}</code>
                </span>
                <span>Click to inspect · Double-click to explore</span>
              </div>
            </Canvas>
          ) : (
            <div className="graph-canvas">
              <EmptyState
                title="No components in this view"
                description="Change the component types or return to the system map."
                action={
                  <Button variant="outline" onClick={reset}>
                    Reset view
                  </Button>
                }
              />
            </div>
          )}
        </div>
        <ComponentInspector
          node={selection}
          onSelect={select}
          onExplore={explore}
          onClose={() => setSelected(null)}
        />
      </div>
    </>
  );
}
function FlowSummary({ flow }: { flow: ArchitectureFlow }) {
  const { seed } = useProject();
  return (
    <aside className="component-inspector flow-summary">
      <Workflow size={25} />
      <h2>{flow.name}</h2>
      <section>
        <h3>Purpose</h3>
        <p>{flow.purpose}</p>
      </section>
      <section>
        <h3>Entry point</h3>
        <code className="source-path">{flow.entryPoint}</code>
      </section>
      <section>
        <h3>Output</h3>
        <p>{flow.output}</p>
      </section>
      <section>
        <h3>Important guarantees</h3>
        <ul className="guarantees">
          {flow.guarantees.map((g) => (
            <li key={g}>
              <ShieldCheck size={14} />
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </section>
      <footer>
        <ExternalLink
          href={`${seed.project.repositoryUrl}/commit/${seed.knowledge.knowledgeRevision}`}
        >
          Knowledge at {seed.knowledge.knowledgeRevision}
        </ExternalLink>
      </footer>
    </aside>
  );
}
export function Architecture() {
  const { seed, go } = useProject(),
    params = useSearchParams();
  const flow =
    seed.flows.find((f) => f.id === params.get("flow")) ?? seed.flows[0];
  const [selected, setSelected] = useState<string | null>(null);
  const node = seed.nodes.find((n) => n.id === selected) ?? null;
  function select(id: string) {
    if (flow.nodeIds.includes(id)) setSelected(id);
    else go(`/codebase?node=${id}`);
  }
  const nodes: ComponentNode[] = flow.nodeIds.map((id, i) => ({
    id,
    type: "component",
    width: 205,
    height: 116,
    position: { x: (i % 3) * 270, y: Math.floor(i / 3) * 165 },
    selected: id === selected,
    data: {
      record: seed.nodes.find((n) => n.id === id)!,
      childrenCount: 0,
      step: i + 1,
      select,
    },
  }));
  const edges: Edge[] = flow.nodeIds.slice(1).map((id, i) => ({
    id: `step-${i}`,
    source: flow.nodeIds[i],
    target: id,
    data: {
      description:
        seed.edges.find((e) => e.source === flow.nodeIds[i] && e.target === id)
          ?.description ?? `Step ${i + 1} to step ${i + 2} in ${flow.name}`,
    },
  }));
  return (
    <>
      <PageHeading
        title="Architecture"
        description="How requests, data, and decisions move through Borrow."
      />
      <div className="flow-selectors">
        {seed.flows.map((f) => (
          <button
            className={
              f.id === flow.id ? "flow-selector selected" : "flow-selector"
            }
            key={f.id}
            aria-pressed={f.id === flow.id}
            onClick={() => {
              setSelected(null);
              go(`/architecture?flow=${f.id}`);
            }}
          >
            <Workflow size={20} />
            <div>
              <strong>{f.name}</strong>
              <p>{f.description}</p>
            </div>
            {f.id === flow.id && <i />}
          </button>
        ))}
      </div>
      <div className="graph-workspace architecture-workspace">
        <div className="graph-main">
          <header className="flow-canvas-heading">
            <h2>{flow.name}</h2>
            <Badge variant="secondary">{flow.nodeIds.length} steps</Badge>
          </header>
          <Canvas
            nodes={nodes}
            edges={edges}
            selected={null}
            viewKey={flow.id}
            architecture
          />
        </div>
        {node ? (
          <ComponentInspector
            node={node}
            onSelect={select}
            onExplore={(id) => {
              const child = seed.nodes.find((n) => n.parentId === id);
              if (child) go(`/codebase?node=${child.id}&scope=${id}`);
            }}
            onClose={() => setSelected(null)}
          />
        ) : (
          <FlowSummary flow={flow} />
        )}
      </div>
    </>
  );
}
