import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ route?: string[] }>;
}) {
  const { route = [] } = await params;
  const known = [
    "activity",
    "codebase",
    "architecture",
    "board",
    "team",
    "search",
    "settings",
    "login",
  ];
  if (
    route.length > 0 &&
    (!known.includes(route[0]) ||
      route.length > 2 ||
      (route.length === 2 && route[0] !== "activity"))
  )
    notFound();
  return null;
}
