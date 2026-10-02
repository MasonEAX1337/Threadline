"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Code2,
  GitBranch,
  KeyRound,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Github } from "./icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { useProject } from "./project-context";
import { Avatar, EmptyState, PageHeader, StatusIcon } from "./shared";
import { toast } from "sonner";
export function TeamPage({ onTask }: { onTask: (id: string) => void }) {
  const { data, tasks } = useProject();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(params.get("member"));
  const member = data.developers.find((u) => u.id === selected);
  useEffect(() => {
    if (params.get("member")) setSelected(params.get("member"));
  }, [params]);
  const members = data.developers.filter((u) =>
    `${u.name} ${u.role} ${u.primaryAreas.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="page-content team-page">
      <PageHeader
        title="Team"
        description="Find the people who know your system—and the areas they work in."
      />
      <div className="team-toolbar">
        <span>{data.developers.length} contributors</span>
        <label className="search-field">
          <Search />
          <input
            aria-label="Search teammates"
            placeholder="Search people or areas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="team-grid">
        {members.map((u) => (
          <button
            key={u.id}
            className="team-card"
            onClick={() => setSelected(u.id)}
          >
            <div className="team-card-heading">
              <Avatar user={u} size="large" />
              <div>
                <h2>{u.name}</h2>
                <p>{u.role}</p>
              </div>
              <ChevronRight />
            </div>
            <h3 className="detail-label">Primary areas</h3>
            <div className="team-areas">
              {u.primaryAreas.map((area) => (
                <Badge variant="secondary" key={area}>
                  {area}
                </Badge>
              ))}
            </div>
            <h3 className="detail-label">Recently</h3>
            <div className="team-recent">
              {data.changes
                .filter((c) => c.authorId === u.id)
                .slice(0, 2)
                .map((c) => (
                  <p key={c.id}>
                    <GitBranch />
                    {c.title}
                  </p>
                ))}
              {!data.changes.some((c) => c.authorId === u.id) && (
                <p>
                  <Code2 />
                  {tasks.find((t) => t.assigneeId === u.id)?.title ??
                    "Project knowledge and documentation"}
                </p>
              )}
            </div>
            <footer>
              <span>{u.changes} changes this month</span>
              <span>
                View profile
                <ArrowRight />
              </span>
            </footer>
          </button>
        ))}
      </div>
      {!members.length && (
        <EmptyState
          title="No teammates match"
          description="Search by name, role, or a primary area."
        />
      )}
      <p className="team-context">
        Activity is context for finding expertise, not a measure of individual
        performance.
      </p>
      <Dialog
        open={!!member}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="member-dialog">
          {member && (
            <>
              <DialogHeader>
                <div className="member-header">
                  <Avatar user={member} size="large" />
                  <div>
                    <DialogTitle>{member.name}</DialogTitle>
                    <DialogDescription>
                      {member.role} · @{member.username}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <p>{member.bio}</p>
              <section>
                <h3 className="detail-label">Primary areas</h3>
                <div className="team-areas">
                  {member.primaryAreas.map((a) => (
                    <Badge variant="secondary" key={a}>
                      {a}
                    </Badge>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="detail-label">Current work</h3>
                {tasks
                  .filter(
                    (t) => t.assigneeId === member.id && t.status !== "done",
                  )
                  .map((t) => (
                    <button
                      className="related-task"
                      key={t.id}
                      onClick={() => {
                        setSelected(null);
                        onTask(t.id);
                      }}
                    >
                      <StatusIcon status={t.status} />
                      <span>{t.title}</span>
                      <ArrowRight />
                    </button>
                  ))}
              </section>
              <section>
                <h3 className="detail-label">Recent changes</h3>
                {data.changes
                  .filter((c) => c.authorId === member.id)
                  .map((c) => (
                    <Link
                      className="related-task"
                      href={`/activity/${c.id}`}
                      onClick={() => setSelected(null)}
                      key={c.id}
                    >
                      <GitBranch />
                      <span>{c.title}</span>
                      <ArrowRight />
                    </Link>
                  ))}
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function SettingsPage({ onSignOut }: { onSignOut: () => void }) {
  const { data, compact, setCompact, reset } = useProject();
  const [agent, setAgent] = useState("repository");
  const [endpoint, setEndpoint] = useState("");
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("codebase:settings") ?? "{}");
      setAgent(s.agent ?? "repository");
      setEndpoint(s.endpoint ?? "");
    } catch {}
  }, []);
  const save = () => {
    localStorage.setItem(
      "codebase:settings",
      JSON.stringify({ agent, endpoint }),
    );
    setSaved(true);
    toast.success("Prototype preferences saved");
  };
  return (
    <div className="page-content settings-page">
      <PageHeader
        title="Settings"
        description="Your repository, your knowledge, your choice of agent."
      />
      <div className="settings-grid">
        <div>
          <section className="panel settings-section">
            <h2>Project</h2>
            <p>Knowledge stays connected to the repository it describes.</p>
            <FieldGroup>
              <Field>
                <FieldLabel>Project name</FieldLabel>
                <input readOnly value={data.project.name} />
              </Field>
              <Field>
                <FieldLabel>Repository</FieldLabel>
                <div className="repository-field">
                  <Github />
                  <code>{data.project.repositoryUrl}</code>
                  <Badge variant="secondary">Sample</Badge>
                </div>
              </Field>
            </FieldGroup>
            <div className="settings-info">
              <Check />
              Repository skill included{" "}
              <code>.agents/skills/project-knowledge/SKILL.md</code>
            </div>
          </section>
          <section className="panel settings-section">
            <h2>Agent & inference</h2>
            <p>
              Agents contribute structured knowledge. The platform stays
              provider-independent.
            </p>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="agent-mode">Knowledge source</FieldLabel>
                <select
                  id="agent-mode"
                  value={agent}
                  onChange={(e) => {
                    setAgent(e.target.value);
                    setSaved(false);
                  }}
                >
                  <option value="repository">Repository agent skill</option>
                  <option value="compatible">
                    OpenAI-compatible endpoint · future adapter
                  </option>
                  <option value="local">
                    Local inference · future adapter
                  </option>
                </select>
                <FieldDescription>
                  These preferences describe the future adapter. This prototype
                  makes no inference requests.
                </FieldDescription>
              </Field>
              {agent === "compatible" && (
                <Field>
                  <FieldLabel htmlFor="agent-endpoint">Endpoint URL</FieldLabel>
                  <input
                    id="agent-endpoint"
                    type="url"
                    placeholder="https://inference.example.com/v1"
                    value={endpoint}
                    onChange={(e) => {
                      setEndpoint(e.target.value);
                      setSaved(false);
                    }}
                  />
                </Field>
              )}
            </FieldGroup>
            <Button variant="outline" onClick={save}>
              {saved ? <Check data-icon="inline-start" /> : null}
              {saved ? "Saved" : "Save preferences"}
            </Button>
          </section>
          <section className="panel settings-section">
            <h2>Interface</h2>
            <div className="preference-row">
              <div>
                <strong>Compact information density</strong>
                <p>Reduce spacing in lists and board cards.</p>
              </div>
              <button
                role="switch"
                aria-checked={compact}
                aria-label="Compact information density"
                className={compact ? "switch active" : "switch"}
                onClick={() => setCompact(!compact)}
              >
                <span />
              </button>
            </div>
            <div className="preference-row">
              <div>
                <strong>Appearance</strong>
                <p>A restrained dark interface for focused work.</p>
              </div>
              <Badge variant="outline">Dark</Badge>
            </div>
          </section>
        </div>
        <aside>
          <section className="panel settings-section">
            <span className="change-icon peach">
              <ShieldCheck />
            </span>
            <h2>Frontend prototype</h2>
            <p>
              Borrow is a fictional neighborhood lending app. Tasks, sessions,
              preferences, and dismissed notifications persist in this browser.
            </p>
            <p>
              GitHub sync, shared agent coordination, OAuth, and inference are
              future integrations.
            </p>
            <Button variant="outline" onClick={() => setResetOpen(true)}>
              Reset sample data
            </Button>
          </section>
          <section className="panel settings-section">
            <h2>Your session</h2>
            <div className="session-user">
              <Avatar user={data.developers[0]} />
              <div>
                <strong>{data.developers[0].name}</strong>
                <small>Project administrator</small>
              </div>
            </div>
            <Button variant="outline" onClick={onSignOut}>
              Sign out
            </Button>
          </section>
        </aside>
      </div>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset the sample project?</DialogTitle>
            <DialogDescription>
              This restores the original Borrow tasks, interface preferences,
              and notifications. Tasks you created in this browser will be
              removed.
            </DialogDescription>
          </DialogHeader>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                reset();
                setResetOpen(false);
              }}
            >
              Reset sample data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = () => {
    localStorage.setItem(
      "codebase:session",
      JSON.stringify({ id: "mason", name: "Mason Brooks", role: "admin" }),
    );
    router.push("/");
    toast.success("Welcome to Borrow");
  };
  return (
    <div className="login-page">
      <Link className="brand" href="/">
        <Box />
        <span>Threadline</span>
      </Link>
      <div className="login-panel">
        <span className="login-project-icon">B</span>
        <h1>
          Your system.
          <br />
          Shared understanding.
        </h1>
        <p>
          Sign in to explore Borrow’s codebase and coordinate your next change.
        </p>
        <Button variant="outline" size="lg" onClick={signIn}>
          <Github data-icon="inline-start" />
          Continue with GitHub
        </Button>
        <div className="login-divider">
          <span />
          or continue with email
          <span />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@team.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={1}
              />
            </Field>
          </FieldGroup>
          <Button size="lg" type="submit">
            Sign in
            <ArrowRight data-icon="inline-end" />
          </Button>
        </form>
        <p className="login-note">
          <KeyRound />
          Demo session. No credentials are sent or stored.
        </p>
      </div>
      <footer>
        Codebase knowledge, maintained by the agents doing the work.
      </footer>
    </div>
  );
}
