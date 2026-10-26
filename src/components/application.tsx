"use client";
import { Github } from "@/components/github-icon";
import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  House,
  Activity as ActivityIcon,
  Code2,
  Workflow,
  Kanban,
  Users,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Bell,
  Menu,
  X,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Flag,
  LogOut,
} from "lucide-react";
import { useProject, ProjectProvider } from "@/components/project-context";
import { Brand } from "@/components/brand";
import { Activity, ChangeDetail } from "@/components/activity";
import { Team, ProjectSettings } from "@/components/people-settings";
import { Overview } from "@/components/overview";
import { Board } from "@/components/board";
import { Login } from "@/components/login";
import { SearchDialog, SearchPage } from "@/components/search";
import { DescribeWork, TaskDialog, OverlapDialog } from "@/components/tasks";
import {
  Avatar,
  Modal,
  EmptyState,
  DecisionDialog,
  UnknownPage,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Snapshot } from "@/types";
const Codebase = dynamic(
  () => import("@/components/graph").then((m) => m.Codebase),
  { ssr: false, loading: () => <p role="status">Loading codebase map…</p> },
);
const Architecture = dynamic(
  () => import("@/components/graph").then((m) => m.Architecture),
  {
    ssr: false,
    loading: () => <p role="status">Loading architecture flows…</p>,
  },
);
const navigation = [
  { href: "/", name: "Overview", icon: House },
  { href: "/activity", name: "Activity", icon: ActivityIcon },
  { href: "/codebase", name: "Codebase", icon: Code2 },
  { href: "/architecture", name: "Architecture", icon: Workflow },
  { href: "/board", name: "Board", icon: Kanban },
  { href: "/team", name: "Team", icon: Users },
];
export function Application({
  seed,
  children,
}: {
  seed: Snapshot;
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider seed={seed}>
      <Workspace>{children}</Workspace>
    </ProjectProvider>
  );
}
function Workspace({ children }: { children: React.ReactNode }) {
  const p = useProject();
  const path = usePathname(),
    router = useRouter(),
    params = useSearchParams();
  const query = params.toString();
  const [mobile, setMobile] = useState(false),
    [projectMenu, setProjectMenu] = useState(false),
    [profileMenu, setProfileMenu] = useState(false),
    [repository, setRepository] = useState(false),
    [notifications, setNotifications] = useState(false),
    [search, setSearch] = useState(false);
  useEffect(() => {
    startTransition(() => {
      setMobile(false);
      setProjectMenu(false);
      setProfileMenu(false);
    });
  }, [path, query]);
  useEffect(() => {
    if (p.hydrated && !p.signedIn && path !== "/login")
      router.replace("/login");
    if (p.hydrated && p.signedIn && path === "/login") router.replace("/");
  }, [p.hydrated, p.signedIn, path, router]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        p.signedIn
      ) {
        e.preventDefault();
        setSearch((value) => !value);
      }
      if (e.key === "Escape") {
        setMobile(false);
        setProjectMenu(false);
        setProfileMenu(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [p.signedIn]);
  if (!p.hydrated)
    return (
      <p role="status" className="p-7 text-muted-foreground">
        Loading project knowledge…
      </p>
    );
  if (path === "/login") return <Login />;
  if (!p.signedIn)
    return (
      <p role="status" className="p-7">
        Opening sign in…
      </p>
    );
  const project = p.seed.projects.find(
    (project) => project.id === p.selectedProject,
  )!;
  const mason = p.seed.developers.find((d) => d.id === "mason")!;
  const section =
    navigation.find((n) =>
      n.href === "/" ? path === "/" : path.startsWith(n.href),
    )?.name ??
    (path === "/settings"
      ? "Settings"
      : path === "/search"
        ? "Search"
        : "Project");
  const unread = p.seed.notifications.filter(
    (n) => !p.dismissedNotificationIds.includes(n.id),
  );
  return (
    <div
      className={p.compact ? "workspace compact" : "workspace"}
      data-ready="true"
    >
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={mobile ? "sidebar open" : "sidebar"}
        aria-label="Project navigation"
      >
        <Link href="/" className="brand-row" aria-label="Threadline overview">
          <Brand />
        </Link>
        <DropdownMenu open={projectMenu} onOpenChange={setProjectMenu}>
          <DropdownMenuTrigger asChild>
            <button className="project-picker" aria-label="Choose project">
              <span className="project-monogram">{project.name[0]}</span>
              <strong>{project.name}</strong>
              <ChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="project-menu">
            <DropdownMenuLabel>Your projects</DropdownMenuLabel>
            <DropdownMenuGroup>
              {p.seed.projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => p.selectProject(project.id)}
                >
                  <span className="menu-project-text">
                    <strong>{project.name}</strong>
                    <small>{project.description}</small>
                  </span>
                  {project.id === p.selectedProject && <Check size={14} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <nav className="primary-nav">
          {navigation.map(({ href, name, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? path === "/" : path.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === "Board" && (
                <span className="nav-count">
                  {p.tasks.filter((t) => t.status !== "done").length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-search" onClick={() => setSearch(true)}>
            <Search size={17} />
            <span>Search…</span>
            <kbd>⌘ K</kbd>
          </button>
          <Link
            href="/settings"
            className="settings-link"
            aria-current={path === "/settings" ? "page" : undefined}
          >
            <Settings size={18} />
            Settings
          </Link>
          <Link href="/settings" className="repository-connection">
            <i className="dot green" />
            <Github size={15} />
            {p.selectedProject === "borrow"
              ? "Sample repository"
              : "Repository preview"}
          </Link>
          <DropdownMenu open={profileMenu} onOpenChange={setProfileMenu}>
            <DropdownMenuTrigger asChild>
              <button className="profile-row">
                <Avatar person={mason} session />
                <span>
                  Mason Brooks<small>Project administrator</small>
                </span>
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => p.go("/team?member=mason")}>
                  View team profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => p.go("/settings")}>
                  Project settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={p.signOut}>
                  <LogOut size={15} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <Button
              className="mobile-nav-trigger"
              variant="ghost"
              size="icon-sm"
              aria-label={mobile ? "Close navigation" : "Open navigation"}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </Button>
            <Link href="/">{project.name}</Link>
            <ChevronRight size={12} />
            <span>{section}</span>
            {path.startsWith("/activity/") && (
              <>
                <ChevronRight size={12} />
                <span>Change</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="branch-control"
              onClick={() => setRepository(true)}
            >
              <GitBranch size={15} />
              <span>main</span>
              <ChevronDown size={12} />
            </button>
            <span className="topbar-divider" />
            <button
              className="bell-button"
              aria-label="Notifications"
              onClick={() => setNotifications(true)}
            >
              <Bell size={18} />
              {unread.length > 0 && <i data-testid="unread-dot" />}
            </button>
            <button aria-label="View team" onClick={() => p.go("/team")}>
              <Avatar person={mason} session />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          {p.selectedProject !== "borrow" ? (
            <EmptyState
              title={`${project.name} is ready for its first knowledge update`}
              description={`${project.name} is a project preview. Explore Borrow to see connected tasks, components, changes, and decisions.`}
              action={
                <Button onClick={() => p.selectProject("borrow")}>
                  Explore Borrow
                </Button>
              }
            />
          ) : path === "/" ? (
            <Overview openRepository={() => setRepository(true)} />
          ) : path === "/activity" ? (
            <Activity key={params.get("component") ?? "all"} />
          ) : /^\/activity\/[^/]+\/?$/.test(path) ? (
            <ChangeDetail key={path} id={path.split("/")[2]} />
          ) : path === "/codebase" ? (
            <Codebase
              key={`${params.get("node") ?? "all"}:${params.get("scope") ?? ""}`}
            />
          ) : path === "/architecture" ? (
            <Architecture key={params.get("flow") ?? "borrow"} />
          ) : path === "/board" ? (
            <Board />
          ) : path === "/team" ? (
            <Team />
          ) : path === "/settings" ? (
            <ProjectSettings />
          ) : path === "/search" ? (
            <SearchPage />
          ) : (
            (children ?? <UnknownPage />)
          )}
        </main>
      </div>
      <DescribeWork />
      <TaskDialog />
      <OverlapDialog />
      <DecisionDialog />
      <SearchDialog open={search} onClose={() => setSearch(false)} />
      <Modal
        open={repository}
        onClose={() => setRepository(false)}
        title={
          <span className="icon-title">
            <Github />
            Borrow repository
          </span>
        }
        description="Borrow is a fictional sample project. Repository and source links show where real integrations will connect."
      >
        <div className="repository-fields">
          <label>
            Repository<code>{p.seed.project.repositoryUrl}</code>
          </label>
          <label>
            Default branch<code>{p.seed.project.defaultBranch}</code>
          </label>
          <label>
            Knowledge revision
            <code>
              {p.seed.knowledge.knowledgeRevision} ·{" "}
              {p.seed.changes[0].relativeTime}
            </code>
          </label>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setRepository(false);
            p.go("/codebase");
          }}
        >
          <Code2 data-icon="inline-start" />
          Explore the codebase
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      </Modal>
      <Modal
        open={notifications}
        onClose={() => setNotifications(false)}
        title="Notifications"
        description="Important updates from your project."
        className="notifications-dialog"
      >
        {unread.length ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => unread.forEach((n) => p.dismissNotification(n.id))}
            >
              Mark all as read
            </Button>
            <div className="notification-list">
              {unread.map((n) => {
                const Icon =
                  n.type === "architecture"
                    ? ShieldCheck
                    : n.type === "milestone"
                      ? Flag
                      : ActivityIcon;
                return (
                  <div key={n.id} className="notification-row">
                    <button
                      onClick={() => {
                        p.dismissNotification(n.id);
                        setNotifications(false);
                        p.go(n.href);
                      }}
                    >
                      <Icon size={19} />
                      <span>
                        <strong>{n.title}</strong>
                        <p>{n.description}</p>
                        <small>{n.time}</small>
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Dismiss ${n.title}`}
                      onClick={() => p.dismissNotification(n.id)}
                    >
                      <Check />
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title="You're all caught up"
            description="New project updates will appear here."
          />
        )}
      </Modal>
    </div>
  );
}
