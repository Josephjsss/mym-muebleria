"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navLinks, company } from "@/data/company";
import { AuthDialogs } from "@/components/site/auth-dialogs";
import PillNav from "@/components/reactbits/PillNav";

export function Navbar({ active = "/" }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-border">
            <Image src="/images/logo-mark.png" alt="Logo M&M" fill sizes="36px" className="object-contain p-1" />
          </span>
          <span className="text-sm sm:text-base leading-tight">
            {company.shortName}
            <span className="block text-[10px] font-normal text-muted-foreground sm:hidden">
              Mueblería y Taller en Melamine
            </span>
          </span>
        </Link>

        <div className="hidden md:block">
          <PillNav
            items={navLinks.map((l) => ({ label: l.label, href: l.href }))}
            activeHref={active}
            baseColor="#0d9488"
            hoveredPillTextColor="#ffffff"
          />
        </div>

        <div className="hidden md:block">
          <AuthDialogs />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4 bg-background">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <AuthDialogs />
        </div>
      )}
    </header>
  );
}
