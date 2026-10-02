"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  Box,
  Check,
  ChevronDown,
  Code2,
  Command,
  GitBranch,
  House,
  Kanban,
  Menu,
  Search,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Github } from "./icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { ProjectProvider, useProject } from "./project-context";
import { Avatar, EmptyState } from "./shared";
import { Overview } from "./overview";
import { ActivityPage, ChangeDetail } from "./activity";
const CodebasePage = dynamic(
  () => import("./graph").then((m) => m.CodebasePage),
  { loading: () => <div className="page-content">Loading codebase map…</div> },
);
const ArchitecturePage = dynamic(
  () => import("./graph").then((m) => m.ArchitecturePage),
  {
    loading: () => (
      <div className="page-content">Loading architecture flows…</div>
    ),
  },
);
import { BoardPage, TaskDetails, DescribeWork, OverlapDialog } from "./board";
import { TeamPage, SettingsPage, LoginPage } from "./people-settings";
import { SearchPalette, SearchPage } from "./search";
import { cn } from "@/lib/utils";
import type { Snapshot } from "@/types";
const nav = [
  { href: "/", label: "Overview", icon: House },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/codebase", label: "Codebase", icon: Code2 },
  { href: "/architecture", label: "Architecture", icon: Workflow },
  { href: "/board", label: "Board", icon: Kanban },
  { href: "/team", label: "Team", icon: Users },
];
export function Application({ snapshot }: { snapshot: Snapshot }) {
  return (
    <ProjectProvider snapshot={snapshot}>
      <AppShell />
      <Toaster theme="dark" position="bottom-right" />
    </ProjectProvider>
  );
}
function AppShell() {
  const {
    data,
    tasks,
    selectedProject,
    selectProject,
    dismissed,
    dismissNotification,
    compact,
    hydrated,
  } = useProject();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [describeOpen, setDescribeOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [overlapOpen, setOverlapOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const current =
    data.projects.find((p) => p.id === selectedProject) ?? data.projects[0];
  const section =
    nav.find((n) =>
      n.href === "/" ? pathname === "/" : pathname.startsWith(n.href),
    )?.label ??
    (pathname === "/settings"
      ? "Settings"
      : pathname === "/search"
        ? "Search"
        : "Project");
  const unread = data.notifications.filter((n) => !dismissed.includes(n.id));
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setProjectOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    setProjectOpen(false);
    setProfileOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (params.get("task")) setTaskId(params.get("task"));
  }, [params]);
  const describe = () => setDescribeOpen(true);
  const openTask = (id: string) => setTaskId(id);
  useEffect(() => {
    if (
      pathname !== "/login" &&
      localStorage.getItem("codebase:session") === "signed-out"
    )
      router.replace("/login");
    else if (!localStorage.getItem("codebase:session"))
      localStorage.setItem(
        "codebase:session",
        JSON.stringify({ id: "mason", name: "Mason Brooks", role: "admin" }),
      );
  }, [pathname, router]);
  const signOut = () => {
    localStorage.setItem("codebase:session", "signed-out");
    setProfileOpen(false);
    router.push("/login");
  };
  if (pathname === "/login") return <LoginPage />;
  let page: React.ReactNode;
  if (selectedProject !== data.project.id)
    page = (
      <div className="page-content">
        <EmptyState
          title={`${current.name} is ready for its first knowledge update`}
          description="This project is a preview. Switch to Borrow to explore the complete sample codebase and agent workflow."
          action={
            <Button onClick={() => selectProject(data.project.id)}>
              <ArrowLeft data-icon="inline-start" />
              Explore Borrow
            </Button>
          }
        />
      </div>
    );
  else if (pathname === "/")
    page = (
      <Overview
        onDescribe={describe}
        onTask={openTask}
        onOverlap={() => setOverlapOpen(true)}
        onRepository={() => setRepoOpen(true)}
      />
    );
  else if (pathname === "/activity") page = <ActivityPage />;
  else if (pathname.startsWith("/activity/"))
    page = <ChangeDetail id={pathname.split("/")[2]} onTask={openTask} />;
  else if (pathname === "/codebase") page = <CodebasePage />;
  else if (pathname === "/architecture") page = <ArchitecturePage />;
  else if (pathname === "/board")
    page = (
      <BoardPage
        onDescribe={describe}
        onTask={openTask}
        onOverlap={() => setOverlapOpen(true)}
      />
    );
  else if (pathname === "/team") page = <TeamPage onTask={openTask} />;
  else if (pathname === "/settings")
    page = <SettingsPage onSignOut={signOut} />;
  else if (pathname === "/search") page = <SearchPage onTask={openTask} />;
  else
    page = (
      <div className="page-content">
        <EmptyState
          title="This page isn't in the project"
          description="Return to the overview to explore Borrow."
          action={
            <Button asChild>
              <Link href="/">Go to overview</Link>
            </Button>
          }
        />
      </div>
    );
  return (
    <div
      className={cn("app-shell", compact && "compact")}
      data-ready={hydrated}
    >
      {mobileOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={cn("sidebar", mobileOpen && "mobile-open")}>
        <Link className="brand" href="/" aria-label="Threadline home">
          <Box />
          <span>Threadline</span>
        </Link>
        <div className="project-picker">
          <button
            className="project-trigger"
            onClick={() => setProjectOpen(!projectOpen)}
            aria-expanded={projectOpen}
          >
            <span className="project-monogram">{current.name[0]}</span>
            <strong>{current.name}</strong>
            <ChevronDown />
          </button>
          {projectOpen && (
            <div className="project-menu" role="menu">
              <span className="menu-label">Your projects</span>
              {data.projects.map((p) => (
                <button
                  role="menuitem"
                  key={p.id}
                  onClick={() => {
                    selectProject(p.id);
                    setProjectOpen(false);
                    router.push("/");
                  }}
                >
                  <span className="project-monogram small">{p.name[0]}</span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.description}</small>
                  </span>
                  {p.id === selectedProject && <Check />}
                </button>
              ))}
            </div>
          )}
        </div>
        <nav aria-label="Primary navigation">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn("nav-item", section === n.label && "selected")}
              aria-current={section === n.label ? "page" : undefined}
            >
              <n.icon />
              <span>{n.label}</span>
              {n.label === "Board" && (
                <span className="nav-count">
                  {tasks.filter((t) => t.status !== "done").length}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="sidebar-search"
            onClick={() => setSearchOpen(true)}
          >
            <Search />
            <span>Search…</span>
            <kbd>⌘ K</kbd>
          </button>
          <Link
            className={cn("nav-item", section === "Settings" && "selected")}
            href="/settings"
          >
            <Settings />
            <span>Settings</span>
          </Link>
          <button
            className="connection"
            onClick={() => router.push("/settings")}
          >
            <span className="green-dot" />
            <Github />
            <span>
              {selectedProject === data.project.id
                ? "Sample repository"
                : "Repository preview"}
            </span>
          </button>
          <div className="profile">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
            >
              <Avatar user={data.developers[0]} />
              <span>{data.developers[0].name}</span>
              <ChevronDown />
            </button>
            {profileOpen && (
              <div className="profile-menu">
                <Link href="/team">View team profile</Link>
                <Link href="/settings">Project settings</Link>
                <button onClick={signOut}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <Button
            className="mobile-menu"
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div className="breadcrumb">
            <span>{current.name}</span>
            <span className="slash">/</span>
            <strong>{section}</strong>
            {pathname.startsWith("/activity/") && (
              <>
                <span className="slash">/</span>
                <span>Change</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="branch-control"
              onClick={() => setRepoOpen(true)}
            >
              <GitBranch />
              <span>main</span>
              <ChevronDown />
            </button>
            <span className="topbar-separator" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open notifications"
              className="notification-trigger"
              onClick={() => setNoticeOpen(true)}
            >
              <Bell />
              {unread.length > 0 && <span className="notification-dot" />}
            </Button>
            <button
              aria-label="Open your profile"
              onClick={() => router.push("/team")}
            >
              <Avatar user={data.developers[0]} size="small" />
            </button>
          </div>
        </header>
        <main id="main-content">{page}</main>
      </div>
      <SearchPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onTask={openTask}
      />
      <DescribeWork
        open={describeOpen}
        onOpenChange={setDescribeOpen}
        onCreated={(task) => {
          router.push(`/board?task=${task.id}`);
        }}
      />
      <TaskDetails
        id={taskId}
        onOpenChange={(open) => {
          if (!open) {
            setTaskId(null);
            if (params.get("task")) {
              const next = new URLSearchParams(params.toString());
              next.delete("task");
              router.replace(pathname + (next.size ? `?${next}` : ""));
            }
          }
        }}
      />
      <OverlapDialog
        open={overlapOpen}
        onOpenChange={setOverlapOpen}
        onTask={(id) => {
          setOverlapOpen(false);
          setTaskId(id);
        }}
      />
      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent className="notifications-dialog">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Important updates from your project.
            </DialogDescription>
          </DialogHeader>
          {unread.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              description="New project updates will appear here."
            />
          ) : (
            unread.map((n) => (
              <div className="notification-row" key={n.id}>
                <span
                  className={cn(
                    "change-icon",
                    n.type === "architecture" ? "peach" : "blue",
                  )}
                >
                  {n.type === "architecture" ? <GitBranch /> : <Bell />}
                </span>
                <Link
                  href={n.href}
                  onClick={() => {
                    dismissNotification(n.id);
                    setNoticeOpen(false);
                  }}
                >
                  <strong>{n.title}</strong>
                  <p>{n.description}</p>
                  <small>{n.time}</small>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Dismiss ${n.title}`}
                  onClick={() => dismissNotification(n.id)}
                >
                  <Check />
                </Button>
              </div>
            ))
          )}
          {unread.length > 0 && (
            <Button
              variant="outline"
              onClick={() => unread.forEach((n) => dismissNotification(n.id))}
            >
              Mark all as read
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={repoOpen} onOpenChange={setRepoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="icon-title">
              <Github />
              Borrow repository
            </DialogTitle>
            <DialogDescription>
              Borrow is a fictional sample project. Repository and source links
              show where real integrations will connect.
            </DialogDescription>
          </DialogHeader>
          <div className="repository-details">
            <label>Repository</label>
            <code>{data.project.repositoryUrl}</code>
            <label>Default branch</label>
            <code>main</code>
            <label>Knowledge revision</label>
            <code>
              {data.knowledge.knowledgeRevision} ·{" "}
              {data.changes[0].relativeTime}
            </code>
          </div>
          <Button variant="outline" asChild>
            <Link href="/codebase" onClick={() => setRepoOpen(false)}>
              <Code2 data-icon="inline-start" />
              Explore the codebase
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
