"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { NightshiftRun, RunArtifact } from "@/lib/types";
import { opCard, opLabel, opPaneBorder, opTitle } from "./operator-theme";

function artifactHref(artifact: RunArtifact) {
  if (!artifact.url) return undefined;
  if (artifact.url.startsWith("/")) return artifact.url.split("#")[0];
  try {
    return new URL(artifact.url).pathname;
  } catch {
    return artifact.url;
  }
}

function artifactLinkProps(artifact: RunArtifact) {
  const href = artifactHref(artifact);
  if (!href) return null;
  const internal = href.startsWith("/");
  const hash = artifact.url?.includes("#")
    ? artifact.url.slice(artifact.url.indexOf("#"))
    : "";
  return {
    href: `${href}${hash}`,
    ...(internal ? {} : { target: "_blank" as const, rel: "noreferrer" }),
  };
}

function ArtifactAction({
  artifact,
  runId,
}: {
  artifact: RunArtifact;
  runId: string;
}) {
  const pathname = usePathname();

  if (artifact.name === "work-pack") {
    const onRunPage = pathname === `/run/${runId}`;
    if (onRunPage) {
      return (
        <button
          type="button"
          onClick={() => {
            document.getElementById("work-pack")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            window.history.replaceState(null, "", `#work-pack`);
          }}
          className="text-xs text-[#e8b923] underline-offset-2 hover:underline"
        >
          View
        </button>
      );
    }
    return (
      <Link
        href={`/run/${runId}#work-pack`}
        className="text-xs text-[#e8b923] underline-offset-2 hover:underline"
      >
        Open
      </Link>
    );
  }

  const link = artifact.url ? artifactLinkProps(artifact) : null;
  if (link) {
    return (
      <a {...link} className="text-xs text-[#e8b923] underline-offset-2 hover:underline">
        Open
      </a>
    );
  }

  if (artifact.content && artifact.type === "csv") {
    return (
      <a
        href={`data:text/csv;charset=utf-8,${encodeURIComponent(artifact.content)}`}
        download={artifact.name}
        className="text-xs text-[#e8b923] underline-offset-2 hover:underline"
      >
        Download
      </a>
    );
  }

  if (artifact.content && artifact.type === "json") {
    return (
      <a
        href={`data:application/json;charset=utf-8,${encodeURIComponent(artifact.content)}`}
        download={artifact.name}
        className="text-xs text-[#e8b923] underline-offset-2 hover:underline"
      >
        Download
      </a>
    );
  }

  if (artifact.content && artifact.type === "png") {
    return (
      <a
        href={`data:image/png;base64,${artifact.content}`}
        download={artifact.name}
        className="text-xs text-[#e8b923] underline-offset-2 hover:underline"
      >
        View
      </a>
    );
  }

  return null;
}

function reconcileRowClass(status: string) {
  if (status === "mismatch") {
    return "border-l-2 border-l-[#f87171] bg-[rgba(248,113,113,0.12)]";
  }
  if (status === "missing") {
    return "border-l-2 border-l-white/35 bg-white/[0.06]";
  }
  return "border-l-2 border-l-transparent";
}

function reconcileStatusClass(status: string) {
  if (status === "matched") return "text-emerald-400";
  if (status === "mismatch") return "font-medium text-red-300";
  return "font-medium text-white/55";
}

export function WorkPane({
  run,
  layout = "column",
}: {
  run: NightshiftRun;
  layout?: "column" | "tab";
}) {
  const mismatches =
    run.reconcile?.filter((r) => r.status !== "matched") ?? [];
  const hasUpperContent =
    (run.reconcile && run.reconcile.length > 0) || run.artifacts.length > 0;

  return (
    <div
      id="work-pack"
      className={`flex h-full min-h-0 flex-col scroll-mt-4 ${
        layout === "tab" ? "overflow-y-auto" : ""
      }`}
    >
      <div className={`shrink-0 border-b ${opPaneBorder} px-4 py-3`}>
        <p className={opLabel}>Work pack</p>
        <p className={opTitle}>
          {mismatches.length} exception{mismatches.length !== 1 ? "s" : ""}
        </p>
      </div>

      {hasUpperContent && (
        <div
          className={`space-y-4 p-4 ${
            layout === "tab" ? "flex-1" : "min-h-0 flex-1 overflow-y-auto"
          }`}
        >
          {run.reconcile && run.reconcile.length > 0 && (
            <section>
              <h3 className={`mb-2 ${opLabel}`}>Reconciliation</h3>
              <div className={`overflow-x-auto rounded-md border text-xs ${opPaneBorder}`}>
                <table className="w-full">
                  <thead className="bg-[#141414] text-[11px] uppercase tracking-wide text-white/55">
                    <tr>
                      <th className="p-2 text-left">Vendor</th>
                      <th className="p-2 text-right">Portal</th>
                      <th className="p-2 text-right">Books</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.reconcile.map((row) => {
                      const isException = row.status !== "matched";
                      const delta = row.portalAmount - row.booksAmount;
                      return (
                      <tr
                        key={row.invoiceId}
                        className={`border-t ${opPaneBorder} ${reconcileRowClass(row.status)}`}
                      >
                        <td className={`p-2 ${isException ? "text-white" : "text-white/85"}`}>
                          {row.vendor}
                        </td>
                        <td className={`p-2 text-right tabular-nums ${isException ? "text-white/90" : "text-white/70"}`}>
                          ${row.portalAmount.toFixed(2)}
                        </td>
                        <td className={`p-2 text-right tabular-nums ${isException ? "text-white/90" : "text-white/70"}`}>
                          ${row.booksAmount.toFixed(2)}
                        </td>
                        <td className={`p-2 capitalize ${reconcileStatusClass(row.status)}`}>
                          {row.status}
                          {isException && delta !== 0 && (
                            <span className="ml-1.5 font-mono text-[10px] normal-case text-red-200/80">
                              ({delta > 0 ? "+" : ""}
                              {delta.toFixed(2)})
                            </span>
                          )}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {run.artifacts.length > 0 && (
            <section>
              <h3 className={`mb-2 ${opLabel}`}>Artifacts</h3>
              <ul className="space-y-2">
                {run.artifacts.map((a) => (
                    <motion.li
                      key={a.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between ${opCard}`}
                    >
                      <span className="text-white/90">{a.name}</span>
                      <ArtifactAction artifact={a} runId={run.id} />
                    </motion.li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {!hasUpperContent && (
        <p className="p-4 text-sm text-white/35">
          Reconciliation and artifacts will appear here as the close progresses.
        </p>
      )}
    </div>
  );
}
