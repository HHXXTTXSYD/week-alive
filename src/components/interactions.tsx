"use client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useState, useTransition } from "react";
import { Bookmark, ThumbsUp, MessageSquare, Flag } from "lucide-react";
import { mutate } from "@/actions/mutations";
import { Button } from "./ui/button";
export function ActionButton({
  kind,
  id,
  initial = false,
}: {
  kind: "favorite" | "vote";
  id: string;
  initial?: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <span className="action-wrap">
      <Button
        variant="secondary"
        className={active ? "selected" : ""}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await mutate(kind, { id });
            setMessage(r.message);
            if (r.ok) setActive(kind === "vote" ? true : !active);
          })
        }
      >
        {kind === "favorite" ? <Bookmark size={16} /> : <ThumbsUp size={15} />}{" "}
        {pending
          ? "处理中…"
          : kind === "favorite"
            ? active
              ? "已收藏"
              : "收藏公司"
            : active
              ? "已标记有用"
              : "有用"}
      </Button>
      {message && (
        <small role="status" className="action-message">
          {message}
        </small>
      )}
    </span>
  );
}
export function Feedback({ id }: { id: string }) {
  const [kind, setKind] = useState<"comment" | "report" | null>(null);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <>
      <Button
        variant="ghost"
        className="text-button"
        onClick={() => setKind(kind === "comment" ? null : "comment")}
      >
        <MessageSquare size={15} /> 回复
      </Button>
      <Button
        variant="ghost"
        className="text-button report"
        onClick={() => setKind(kind === "report" ? null : "report")}
      >
        <Flag size={14} /> 举报
      </Button>
      {kind && (
        <form
          className="inline-form"
          action={(form) =>
            start(async () => {
              const result = await mutate(kind, {
                id,
                content: form.get("content"),
              });
              setMessage(result.message);
              if (result.ok) setKind(null);
            })
          }
        >
          <Label>
            {kind === "report" ? "举报原因" : "写下你的回复"}
            <Textarea name="content" required minLength={5} maxLength={1000} />
          </Label>
          <Button disabled={pending}>{pending ? "提交中…" : "提交审核"}</Button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </>
  );
}
export function Moderate({ id, table }: { id: string; table: string }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="actions">
      {["published", "rejected", "hidden"].map((status, i) => (
        <Button
          variant="outline"
          key={status}
          disabled={pending}
          onClick={() =>
            start(async () =>
              setMessage(
                (await mutate("moderate", { id, table, status })).message,
              ),
            )
          }
        >
          {["通过", "拒绝", "隐藏"][i]}
        </Button>
      ))}
      <span role="status">{message}</span>
    </div>
  );
}
