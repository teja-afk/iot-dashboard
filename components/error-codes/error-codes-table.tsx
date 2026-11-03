"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ErrorCode } from "@/types";

export function ErrorCodesTable({ codes }: { codes: ErrorCode[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const filtered = codes.filter((code) =>
    `${code.checkCode} ${code.title} ${code.description} ${code.errorType} ${code.recovery} ${code.datetime}`
      .toLowerCase()
      .includes(normalized),
  );

  return (
    <Card className="gap-0 border-[#dce9e5] py-0">
      <CardHeader className="border-b border-[#edf3f0] py-4">
        <CardTitle className="text-base text-[#17352f]">Error code list</CardTitle>
        <CardDescription>
          Reference table of CPU error codes, recovery steps, and revision notes.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-5">
        <div className="mb-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search check code, title, description, recovery…"
            aria-label="Search error codes"
            className="h-9 bg-white"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            No error codes match “{query}”. Try another search term.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-2 pr-4 font-normal">Check code</th>
                  <th className="pb-2 pr-4 font-normal">Title</th>
                  <th className="pb-2 pr-4 font-normal">Description</th>
                  <th className="pb-2 pr-4 font-normal">Error type</th>
                  <th className="pb-2 pr-4 font-normal">Power reset</th>
                  <th className="pb-2 pr-4 font-normal">Recovery</th>
                  <th className="pb-2 pr-4 font-normal">Revision</th>
                  <th className="pb-2 font-normal">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((code) => (
                  <tr key={code.id} className="border-b border-slate-50">
                    <td className="py-3 pr-4 font-mono font-medium text-[#17352f]">
                      {code.checkCode}
                    </td>
                    <td className="py-3 pr-4 font-medium text-[#17352f]">{code.title}</td>
                    <td className="py-3 pr-4 text-slate-500">{code.description}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={
                          code.errorType.toLowerCase() === "major"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-sky-50 text-sky-700"
                        }
                      >
                        {code.errorType}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={
                          code.powerResetRequiredToClearCheckCode === "YES"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }
                      >
                        {code.powerResetRequiredToClearCheckCode}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{code.recovery}</td>
                    <td className="py-3 pr-4 text-slate-500">{code.revision}</td>
                    <td className="py-3 text-slate-500">{code.datetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}