"use client";

import { useState } from "react";
import Modal from "./Modal";
import AddKeywordForm from "./AddKeywordForm";

export default function AddKeywordTrigger({
  domainId,
  defaultCountry,
  defaultLanguage,
  defaultLocation,
}: {
  domainId: string;
  defaultCountry: string;
  defaultLanguage: string;
  defaultLocation: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors"
      >
        + Add keyword
      </button>
      {open && (
        <Modal title="Add keyword" onClose={() => setOpen(false)}>
          <AddKeywordForm
            domainId={domainId}
            defaultCountry={defaultCountry}
            defaultLanguage={defaultLanguage}
            defaultLocation={defaultLocation}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
