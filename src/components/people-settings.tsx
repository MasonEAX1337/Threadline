"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, Search, Check, ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/components/project-context";
import {
  Avatar,
  Modal,
  PageHeading,
  Panel,
  EmptyState,
  StatusIcon,
  Select,
} from "@/components/shared";
import { Github } from "@/components/github-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { safeRead, safeWrite, SETTINGS_KEY } from "@/lib/storage";

export function Team() {
  const p = useProject(),
    params = useSearchParams(),
    router = useRouter();
  const [query, setQuery] = useState("");
  const people = p.seed.developers.filter((d) =>
    [d.name, d.role, ...d.primaryAreas]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const member = p.seed.developers.find((d) => d.id === params.get("member"));
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("member");
    router.replace(`/team${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  return (
    <>
      <PageHeading
        title="Team"
        description="Find the people who know your system—and the areas they work in."
      />
      <div className="toolbar">
        <span className="muted">{p.seed.developers.length} contributors</span>
        <div className="search-field">
          <Search size={16} />
          <Input
            aria-label="Search people or areas"
            placeholder="Search people or areas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {people.length ? (
        <div className="team-grid">
          {people.map((d) => {
            const changes = p.seed.changes.filter((c) => c.authorId === d.id);
            const task = p.tasks.find(
              (t) => t.assigneeId === d.id && t.status !== "done",
            );
            return (
              <article className="person-card" key={d.id}>
                <Link className="person-heading" href={`/team?member=${d.id}`}>
                  <Avatar person={d} large />
                  <div>
                    <h2>{d.name}</h2>
                    <p>{d.role}</p>
                  </div>
                  <ChevronRight size={16} />
                </Link>
                <h3>Primary areas</h3>
                <div className="chips">
                  {d.primaryAreas.map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </div>
                <h3>Recently</h3>
                <div className="person-recent">
                  {changes.length ? (
                    changes.slice(0, 2).map((c) => (
                      <Link key={c.id} href={`/activity/${c.id}`}>
                        {c.title}
                        <ChevronRight size={12} />
                      </Link>
                    ))
                  ) : task ? (
                    <button onClick={() => p.openTask(task.id)}>
                      {task.title}
                    </button>
                  ) : (
                    <p>Project knowledge and documentation</p>
                  )}
                </div>
                <footer>
                  <span>{d.changes} changes this month</span>
                  <Link href={`/team?member=${d.id}`}>
                    View profile <ChevronRight size={12} />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No teammates match"
          description="Search by name, role, or primary area."
        />
      )}
      <p className="expertise-note">
        Activity is context for finding expertise, not a measure of individual
        performance.
      </p>
      <Modal
        open={Boolean(member)}
        onClose={close}
        title={member?.name ?? "Team profile"}
        description={member?.role ?? "Contributor profile"}
      >
        {member && (
          <>
            <div className="profile-summary">
              <Avatar person={member} large />
              <code>@{member.username}</code>
            </div>
            <p>{member.bio}</p>
            <div className="chips">
              {member.primaryAreas.map((a) => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
            <section className="dialog-section">
              <h3>Current work</h3>
              {p.tasks
                .filter(
                  (t) => t.assigneeId === member.id && t.status !== "done",
                )
                .map((t) => (
                  <button
                    className="related-work"
                    key={t.id}
                    onClick={() => {
                      p.go(`/board?task=${t.id}`);
                    }}
                  >
                    <StatusIcon status={t.status} />
                    <span>
                      <code>{t.id}</code> {t.title}
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              {!p.tasks.some(
                (t) => t.assigneeId === member.id && t.status !== "done",
              ) && <p>No active tasks assigned.</p>}
            </section>
            <section className="dialog-section">
              <h3>Authored changes</h3>
              {p.seed.changes
                .filter((c) => c.authorId === member.id)
                .map((c) => (
                  <Link
                    className="related-work"
                    key={c.id}
                    href={`/activity/${c.id}`}
                  >
                    <span>{c.title}</span>
                    <small>{c.relativeTime}</small>
                    <ChevronRight size={14} />
                  </Link>
                ))}
              {!p.seed.changes.some((c) => c.authorId === member.id) && (
                <p>No changes in this recorded feed.</p>
              )}
            </section>
          </>
        )}
      </Modal>
    </>
  );
}

type Preferences = {
  source: "repository" | "compatible" | "local";
  endpoint: string;
};
function readPreferences(): Preferences {
  try {
    const value = JSON.parse(
      safeRead(SETTINGS_KEY) ?? "null",
    ) as Partial<Preferences> | null;
    if (
      value &&
      ["repository", "compatible", "local"].includes(value.source ?? "")
    )
      return {
        source: value.source!,
        endpoint: typeof value.endpoint === "string" ? value.endpoint : "",
      };
  } catch {}
  return { source: "repository", endpoint: "" };
}
export function ProjectSettings() {
  const p = useProject();
  const [preferences, setPreferences] = useState(readPreferences),
    [saved, setSaved] = useState(false),
    [confirm, setConfirm] = useState(false);
  const mason = p.seed.developers.find((d) => d.id === "mason")!;
  return (
    <>
      <PageHeading
        title="Settings"
        description="Your repository, your knowledge, your choice of agent."
      />
      <div className="settings-grid">
        <div className="settings-main">
          <Panel title="Project">
            <label className="settings-field">
              Project name
              <Input readOnly value={p.seed.project.name} />
            </label>
            <label className="settings-field">
              Repository
              <div className="repository-value">
                <Github size={18} />
                <code>{p.seed.project.repositoryUrl}</code>
                <Badge>Sample</Badge>
              </div>
            </label>
            <div className="skill-included">
              <ShieldCheck size={18} />
              <div>
                <strong>Repository skill included</strong>
                <code>.agents/skills/project-knowledge/SKILL.md</code>
              </div>
            </div>
          </Panel>
          <Panel title="Agent & inference">
            <p>
              Agents contribute structured knowledge. Threadline is
              provider-independent, so your team can choose the tools that fit
              its work.
            </p>
            <Select
              label="Knowledge source"
              value={preferences.source}
              onChange={(source) => {
                setPreferences({
                  ...preferences,
                  source: source as Preferences["source"],
                });
                setSaved(false);
              }}
            >
              <option value="repository">Repository agent skill</option>
              <option value="compatible">
                OpenAI-compatible endpoint · future adapter
              </option>
              <option value="local">Local inference · future adapter</option>
            </Select>
            {preferences.source === "compatible" && (
              <label className="settings-field">
                Endpoint URL
                <Input
                  type="url"
                  placeholder="https://inference.example.com/v1"
                  value={preferences.endpoint}
                  onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      endpoint: e.target.value,
                    });
                    setSaved(false);
                  }}
                />
              </label>
            )}
            <p className="settings-helper">
              These preferences describe future adapters. This prototype makes
              no inference requests.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                safeWrite(SETTINGS_KEY, JSON.stringify(preferences));
                setSaved(true);
                toast.success("Preferences saved");
              }}
            >
              {saved ? (
                <>
                  <Check size={15} />
                  Saved
                </>
              ) : (
                "Save preferences"
              )}
            </Button>
          </Panel>
          <Panel title="Interface">
            <div className="preference-row">
              <div>
                <label htmlFor="compact">Compact information density</label>
                <p>Reduce spacing in lists and board cards.</p>
              </div>
              <Switch
                id="compact"
                checked={p.compact}
                onCheckedChange={p.setCompact}
              />
            </div>
            <div className="preference-row">
              <div>
                <strong>Appearance</strong>
                <p>A restrained dark interface for focused work</p>
              </div>
              <Badge variant="secondary">Dark</Badge>
            </div>
          </Panel>
        </div>
        <aside className="settings-side">
          <Panel title="Frontend prototype">
            <p>
              Borrow is a fictional sample project. Task edits, notifications,
              and interface choices persist in this browser.
            </p>
            <p>
              GitHub sync, shared agent coordination, OAuth, and inference are
              future integrations. Browser actions do not execute code or
              synchronize repositories.
            </p>
            <Button variant="outline" onClick={() => setConfirm(true)}>
              Reset sample data
            </Button>
          </Panel>
          <Panel title="Your session">
            <div className="session-details">
              <Avatar person={mason} session />
              <div>
                <strong>Mason Brooks</strong>
                <p>Project administrator</p>
              </div>
            </div>
            <Button variant="outline" onClick={p.signOut}>
              <LogOut size={15} />
              Sign out
            </Button>
          </Panel>
        </aside>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset the sample project?"
        description="This restores Borrow tasks, interface preferences, and notifications and removes browser-created tasks. Your inference preferences are preserved."
      >
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              p.reset();
              setConfirm(false);
              toast.success("Sample project restored");
            }}
          >
            Reset sample data
          </Button>
        </div>
      </Modal>
    </>
  );
}
