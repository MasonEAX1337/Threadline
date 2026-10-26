import { readKnowledge, validateKnowledge } from "./knowledge.mjs";
try {
  const data = validateKnowledge(await readKnowledge());
  console.log(
    `Knowledge valid: ${data.components.length} components, ${data.tasks.length} tasks, ${data.changes.length} changes, ${data.decisions.length} decisions. Revision ${data.manifest.knowledgeRevision}.`,
  );
} catch (error) {
  console.error(`Knowledge validation failed:\n${error.message}`);
  process.exitCode = 1;
}
