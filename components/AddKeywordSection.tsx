"use client";

import { useState } from "react";
import AddKeywordForm from "./AddKeywordForm";
import BulkAddKeywordForm from "./BulkAddKeywordForm";

export default function AddKeywordSection({
  domainId,
  defaultCountry,
  defaultLanguage,
}: {
  domainId: string;
  defaultCountry: string;
  defaultLanguage: string;
}) {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  const tabClasses = (active: boolean) =>
    `text-xs px-2 py-1 rounded-md ${
      active ? "bg-ink text-white" : "text-muted hover:text-ink"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <button onClick={() => setMode("single")} className={tabClasses(mode === "single")}>
          Add one
        </button>
        <button onClick={() => setMode("bulk")} className={tabClasses(mode === "bulk")}>
          Add in bulk
        </button>
      </div>

      {mode === "single" ? (
        <AddKeywordForm
          domainId={domainId}
          defaultCountry={defaultCountry}
          defaultLanguage={defaultLanguage}
        />
      ) : (
        <BulkAddKeywordForm
          domainId={domainId}
          defaultCountry={defaultCountry}
          defaultLanguage={defaultLanguage}
        />
      )}
    </div>
  );
}
