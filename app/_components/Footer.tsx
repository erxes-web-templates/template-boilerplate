"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_CMS_MENU_LIST } from "../../graphql/queries";
import { templateUrl, getFileUrl } from "../../lib/utils";
import { CPDetail, MenuItem } from "../../types/cms";
import {
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const parseStringOrArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }
  return [];
};

export default function Footer({ cpDetail }: { cpDetail: CPDetail }) {
  const { data } = useQuery(GET_CMS_MENU_LIST, {
    variables: { kind: "footer" },
  });

  const menus: MenuItem[] = data?.cpMenus || [];

  const socialLinks = [
    { href: cpDetail?.externalLinks?.facebook, Icon: Facebook, label: "Facebook" },
    { href: cpDetail?.externalLinks?.instagram, Icon: Instagram, label: "Instagram" },
    { href: cpDetail?.externalLinks?.youtube, Icon: Youtube, label: "YouTube" },
    { href: cpDetail?.externalLinks?.twitter, Icon: Twitter, label: "Twitter" },
    { href: cpDetail?.externalLinks?.linkedin, Icon: Linkedin, label: "LinkedIn" },
    {
      href: cpDetail?.externalLinks?.whatsapp
        ? `https://wa.me/${cpDetail.externalLinks.whatsapp.replace(/[^0-9]/g, "")}`
        : undefined,
      Icon: MessageCircle,
      label: "WhatsApp",
    },
  ].filter((s) => !!s.href);

  const phones = parseStringOrArray(cpDetail?.externalLinks?.phones);
  const emails = parseStringOrArray(cpDetail?.externalLinks?.emails);

  return (
    <footer style={{ backgroundColor: "var(--primary)" }} className="text-white">
      {/* Hero CTA band */}
      {(cpDetail?.name || cpDetail?.logo) && (
        <div className="relative overflow-hidden border-b border-white/10">
          {/* subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.10) 0%, transparent 70%)",
            }}
          />
          <div className="container mx-auto max-w-6xl px-4 py-16 relative z-10 flex flex-col items-center text-center gap-6">
            {cpDetail?.logo && (
              <Image
                src={getFileUrl(cpDetail.logo)}
                alt={cpDetail?.name || "Logo"}
                width={180}
                height={64}
                className="object-contain brightness-0 invert opacity-90"
              />
            )}
            {cpDetail?.name && (
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {cpDetail.name}
              </h2>
            )}
            {cpDetail?.description && (
              <p className="text-base text-white/70 max-w-xl leading-relaxed">
                {cpDetail.description}
              </p>
            )}
            {emails[0] && (
              <a
                href={`mailto:${emails[0]}`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all duration-200 backdrop-blur-sm"
              >
                <Mail className="h-4 w-4" />
                {emails[0]}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main footer content */}
      <div className="container mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href={templateUrl("/")} className="inline-block">
              {cpDetail?.logo ? (
                <Image
                  src={getFileUrl(cpDetail.logo)}
                  alt={cpDetail?.name || "Logo"}
                  width={140}
                  height={48}
                  className="object-contain brightness-0 invert"
                />
              ) : (
                <span className="text-xl font-bold text-white">
                  {cpDetail?.name || "Company"}
                </span>
              )}
            </Link>
            {cpDetail?.description && (
              <p className="mt-4 text-sm text-white/70 leading-relaxed">
                {cpDetail.description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {socialLinks.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/25 transition-colors text-white/70 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {menus.length > 0 ? (
                menus.map((menu: MenuItem) => (
                  <li key={menu._id}>
                    <Link
                      href={templateUrl(menu.url || "/")}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {menu.label}
                    </Link>
                  </li>
                ))
              ) : (
                [
                  { label: "Home", url: "/" },
                  { label: "Tours", url: "/tours" },
                  { label: "About Us", url: "/about" },
                  { label: "Contact", url: "/contact" },
                  { label: "Inquiry", url: "/inquiry" },
                ].map((item) => (
                  <li key={item.url}>
                    <Link
                      href={templateUrl(item.url)}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              {cpDetail?.externalLinks?.address && (
                <li className="flex gap-3 text-sm text-white/70">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-white/50" />
                  <span>{cpDetail.externalLinks.address}</span>
                </li>
              )}
              {phones.map((phone, i) => (
                <li key={i}>
                  <a
                    href={`tel:${phone}`}
                    className="flex gap-3 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <Phone className="h-4 w-4 shrink-0 mt-0.5 text-white/50" />
                    {phone}
                  </a>
                </li>
              ))}
              {emails.map((email, i) => (
                <li key={i}>
                  <a
                    href={`mailto:${email}`}
                    className="flex gap-3 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4 shrink-0 mt-0.5 text-white/50" />
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>
            {cpDetail?.copyright ||
              `© ${new Date().getFullYear()} ${cpDetail?.name || "Company"}. All rights reserved.`}
          </p>
          <div className="flex gap-4">
            <Link href={templateUrl("/legal")} className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link href={templateUrl("/legal")} className="hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
