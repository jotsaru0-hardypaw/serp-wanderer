"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

type TagCount = { tag: string; count: number };

export default function TagManager({ domainId, onClose }: { domainId: string; onClose: () => void }) {
  const [tags, setTags] = useState<TagCount[] | null>(null);
  const [busyTag, setBusyTag] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/domains/${domainId}/tags`)
      .then((r) => r.json())
      .then((body) => setTags(body.tags ?? []))
      .catch(() => setTags([]));
  }, [domainId]);

  async function rename(oldTag: string) {
    const newTag = prompt(`Rename "${oldTag}" to:`, oldTag);
    if (!newTag || newTag.trim() === oldTag) return;
    setBusyTag(oldTag);
    await fetch(`/api/domains/${domainId}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldTag, newTag: newTag.trim() }),
    }).catch(() => null);
    setBusyTag(null);
    router.refresh();
    onClose();
  }

  async function removeTag(tag: string) {
    if (!confirm(`Remove tag "${tag}" from all keywords? The keywords themselves won't be deleted.`)) return;
    setBusyTag(tag);
    await fetch(`/api/domains/${domainId}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    }).catch(() => null);
    setBusyTag(null);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center pt-24 bg-ink/20" onClick={onClose}>
      <div
        className="w-80 rounded-md border border-line bg-surface shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Manage tags</h2>
          <button onClick={onClose} className="text-xs text-muted hover:text-ink">
            Close
          </button>
        </div>

        {tags == null && <p className="text-xs text-muted">Loading…</p>}
        {tags?.length === 0 && <p className="text-xs text-muted">No tags yet.</p>}

        <div className="space-y-1">
          {tags?.map(({ tag, count }) => (
            <div key={tag} className="flex items-center justify-between text-xs py-1">
              <span className="text-ink">
                {tag} <span className="text-muted">({count})</span>
              </span>
              <div className="flex items-center gap-2">
                {busyTag === tag ? (
                  <Spinner />
                ) : (
                  <>
                    <button onClick={() => rename(tag)} className="text-muted hover:text-accent">
                      Rename
                    </button>
                    <button onClick={() => removeTag(tag)} className="text-muted hover:text-fall">
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
