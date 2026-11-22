"use client";

import { LoaderCircle, TriangleAlert } from "@/components/ui/glyphs";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";


interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "default" | "danger";
    pending?: boolean;
    icon?: React.ReactNode;
}

/** The safe choice has focus, so Enter never destroys anything by accident */
export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
    pending = false,
    icon
}: Props) {
    const cancel = useRef<HTMLButtonElement>(null);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            icon={icon ?? <TriangleAlert className="size-5" />}
            tone={tone}
            size="sm"
            initialFocus={cancel}
            dismissible={!pending}
            footer={
                <>
                    <Button ref={cancel} variant="secondary" size="md" onClick={onClose} disabled={pending}>
                        {cancelLabel}
                    </Button>
                    <Button variant={tone === "danger" ? "destructive" : "primary"} size="md" onClick={onConfirm} disabled={pending}>
                        {pending && <LoaderCircle className="size-4 animate-spin" />}
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {children}
        </Dialog>
    );
}
