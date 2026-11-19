"use client";

import { useState } from "react";
import { Check, Link2, Mail, MessageCircle, Share2 } from "lucide-react";

export function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: Share2,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      icon: Share2,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${t}%20${u}`,
      icon: MessageCircle,
    },
    {
      label: "Email",
      href: `mailto:?subject=${t}&body=${u}`,
      icon: Mail,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: do nothing
    }
  }

  const chip =
    "inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-container-low px-3.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-high";

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
          aria-label={`Share on ${label}`}
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </a>
      ))}
      <button type="button" onClick={copyLink} className={chip}>
        {copied ? (
          <Check className="size-3.5 text-primary" aria-hidden />
        ) : (
          <Link2 className="size-3.5" aria-hidden />
        )}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}