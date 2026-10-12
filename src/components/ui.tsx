"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" | "gold" }) {
  return <button className={`button button-${variant} ${className}`.trim()} {...props} />;
}

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={className} {...props} />;
}

export function AmountChip({ label, selected, onSelect }: { label: ReactNode; selected: boolean; onSelect: () => void }) {
  return <button type="button" className="amount-chip" aria-pressed={selected} onClick={onSelect}>{label}</button>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized}><div className="progress-fill" style={{ width: `${normalized}%` }} /></div>;
}

export type LeaderboardRow = { name: string; detail: string; amount: string };

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return <div className="leader-list" role="list">{rows.map((row, index) => <div className="leader-item" role="listitem" key={row.name}><span className="rank-num">{String(index + 1).padStart(2, "0")}</span><div><strong>{row.name}</strong><span>{row.detail}</span></div><strong className="leader-amount">{row.amount}</strong></div>)}</div>;
}

export function AuthModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return <AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}><motion.section className="donation-sheet" role="dialog" aria-modal="true" aria-label="Optional sign in" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }}>{children}</motion.section></motion.div>}</AnimatePresence>;
}

export function Toast({ message }: { message: string }) {
  return <AnimatePresence>{message && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={14} />{message}</motion.div>}</AnimatePresence>;
}

export function KindnessMark() {
  return <span className="brand-mark" aria-hidden="true"><Sparkles size={18} /></span>;
}
