"use client";

import type { StandingRow, Team } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function GroupTable({
  title,
  standings,
  teams,
  qualifyCount,
  bestThirdHighlight,
}: {
  title: string;
  standings: StandingRow[];
  teams: Team[];
  qualifyCount: number;
  bestThirdHighlight?: boolean;
}) {
  const { t } = useI18n();
  const teamMap = new Map(teams.map((team) => [team.id, team]));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface/60">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-display text-2xl tracking-wide">
          {t("table.group", { name: title })}
        </h3>
        <span className="text-xs uppercase tracking-wider text-mist">
          {t("table.topQualify", { count: qualifyCount })}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-mist">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">{t("table.team")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.pld")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.w")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.d")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.l")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.gf")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.ga")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.gd")}</th>
              <th className="px-2 py-2 font-medium text-center">{t("table.pts")}</th>
              <th className="px-3 py-2 font-medium">{t("table.form")}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const team = teamMap.get(row.teamId);
              const isQualify = row.rank <= qualifyCount;
              const isBestThird =
                bestThirdHighlight && row.rank === qualifyCount + 1;
              return (
                <tr
                  key={row.teamId}
                  className={cn(
                    "border-t border-border/60 transition-colors",
                    isQualify && "qualify-row",
                    isBestThird && "bg-gold/10",
                    !isQualify &&
                      !isBestThird &&
                      row.rank >
                        qualifyCount + (bestThirdHighlight ? 1 : 0) &&
                      "eliminate-row"
                  )}
                >
                  <td className="px-3 py-2.5 tabular-nums text-mist">
                    {row.rank}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-[10px] font-bold text-white"
                        style={{ background: team?.crest_color ?? "#555" }}
                      >
                        {team?.short_code?.slice(0, 3) ?? "?"}
                      </span>
                      <span className="font-semibold">
                        {team?.name ?? "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.played}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.won}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.drawn}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.lost}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.goalsFor}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.goalsAgainst}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {row.goalDifference > 0
                      ? `+${row.goalDifference}`
                      : row.goalDifference}
                  </td>
                  <td className="px-2 py-2.5 text-center text-base font-bold tabular-nums">
                    {row.points}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-0.5">
                      {row.form.map((f, i) => (
                        <span
                          key={i}
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-sm text-[10px] font-bold",
                            f === "W" && "form-w",
                            f === "D" && "form-d",
                            f === "L" && "form-l"
                          )}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
