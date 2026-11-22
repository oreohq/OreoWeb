"use client";

import { api, errorMessage, isApiError, paths } from "@/lib/api/client";
import { LoaderCircle, Receipt } from "@/components/ui/glyphs";
import { useToast } from "@/components/dashboard/toast";
import type { PremiumSummary } from "@/lib/api/types";
import { Field, Input } from "@/components/ui/field";
import { useEffect, useId, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mutate } from "@/lib/api/hooks";


export function ClaimDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
    const toast = useToast();
    const formId = useId();
    const [transactionId, setTransactionId] = useState("");
    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setTransactionId("");
        setEmail("");
        setError(null);
    }, [open]);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (pending) return;
        setPending(true);
        setError(null);
        try {
            const result = await api.post<{ claimed: number, premium: PremiumSummary }>(paths.premiumClaim, {
                transactionId: transactionId.trim(),
                email: email.trim()
            });
            mutate(paths.premium, result.premium);
            toast.success(result.claimed === 1 ? "Payment claimed" : `${result.claimed} payments claimed`, {
                description: "Your premium is ready to give to a server."
            });
            onClose();
        } catch (failure) {
            setError(errorMessage(failure));
            if (!isApiError(failure) || ![400, 404, 409].includes(failure.status)) toast.error(failure, { title: "Couldn't claim it" });
        } finally {
            setPending(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            dismissible={!pending}
            icon={<Receipt className="size-5" />}
            title="Claim a Ko-fi payment"
            description="Paid without connecting Discord on Ko-fi? Enter the transaction ID from Ko-fi's receipt email and the email you paid with."
            footer={
                <>
                    <Button variant="secondary" size="md" onClick={onClose} disabled={pending}>Cancel</Button>
                    <Button variant="primary" size="md" type="submit" form={formId} disabled={pending || !transactionId.trim() || !email.trim()}>
                        {pending && <LoaderCircle className="animate-spin" />}
                        Claim
                    </Button>
                </>
            }
        >
            <form id={formId} onSubmit={submit} className="space-y-4">
                <Field label="Transaction ID" htmlFor={`${formId}-tx`} description="It is in the receipt Ko-fi emailed you, and looks like 00000000-1111-2222-3333-444444444444.">
                    <Input
                        id={`${formId}-tx`}
                        value={transactionId}
                        onChange={(event) => setTransactionId(event.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={100}
                        aria-invalid={Boolean(error) || undefined}
                    />
                </Field>
                <Field
                    label="Email you paid with"
                    htmlFor={`${formId}-email`}
                    error={error}
                    description="Used once to match the payment. Oreo doesn't store it."
                >
                    <Input
                        id={`${formId}-email`}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        maxLength={320}
                        aria-invalid={Boolean(error) || undefined}
                    />
                </Field>
            </form>
        </Dialog>
    );
}
