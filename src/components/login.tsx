"use client";
import { Github } from "@/components/github-icon";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/brand";
import { useProject } from "@/components/project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
export function Login() {
  const { signIn } = useProject();
  function enter() {
    signIn();
    toast.success("Welcome to Borrow");
  }
  return (
    <div className="login-page">
      <header>
        <Brand />
      </header>
      <main id="main-content" tabIndex={-1} className="login-panel">
        <span className="project-monogram large">B</span>
        <h1>
          Your system.
          <br />
          <span>Shared understanding.</span>
        </h1>
        <p>
          Sign in to explore Borrow’s codebase and coordinate your next change.
        </p>
        <Button variant="outline" size="lg" onClick={enter}>
          <Github data-icon="inline-start" />
          Continue with GitHub
        </Button>
        <div className="login-divider">or continue with email</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            enter();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                id="email"
                autoComplete="off"
                required
                placeholder="you@example.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                id="password"
                autoComplete="off"
                required
                placeholder="Enter a demo password"
              />
            </Field>
            <Button type="submit" size="lg">
              Sign in
              <ArrowRight data-icon="inline-end" />
            </Button>
          </FieldGroup>
        </form>
        <small>Demo session. No credentials are sent or stored.</small>
      </main>
      <footer>
        Codebase knowledge, maintained by the agents doing the work.
      </footer>
    </div>
  );
}
