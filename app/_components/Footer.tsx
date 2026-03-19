import { CPDetail, MenuItem } from "../../types/cms";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { GET_CMS_MENU_LIST } from "../../graphql/queries";
import { templateUrl } from "@/lib/utils";
import {
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";

export default function Footer({ cpDetail }: { cpDetail: CPDetail }) {
  const { data } = useQuery(GET_CMS_MENU_LIST, {
    variables: { kind: "footer" },
  });

  const menus = data?.cpMenus || [];

  const socialLinks = [
    { href: cpDetail?.externalLinks?.facebook, Icon: Facebook },
    { href: cpDetail?.externalLinks?.twitter, Icon: Twitter },
    { href: cpDetail?.externalLinks?.linkedin, Icon: Linkedin },
    { href: cpDetail?.externalLinks?.youtube, Icon: Youtube },
    { href: cpDetail?.externalLinks?.instagram, Icon: Instagram },
    { href: cpDetail?.externalLinks?.whatsapp, Icon: MessageCircle },
  ].filter((s) => !!s.href);

  const hasContact =
    cpDetail?.externalLinks?.emails?.[0] ||
    cpDetail?.externalLinks?.phones?.[0] ||
    cpDetail?.externalLinks?.address;

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href={templateUrl("/")}
              className="text-sm font-semibold text-foreground"
            >
              {cpDetail?.name}
            </Link>
            {cpDetail?.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cpDetail.description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-1">
                {socialLinks.map(({ href, Icon }) => (
                  <a
                    key={href}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {menus.length > 0 && (
            <div>
              <ul className="space-y-2">
                {menus.map((menu: MenuItem) => (
                  <li key={menu._id}>
                    <Link
                      href={templateUrl(menu.url || "/")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {menu.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          {hasContact && (
            <div className="space-y-2">
              {cpDetail?.externalLinks?.emails[0] && (
                <a
                  href={`mailto:${cpDetail.externalLinks.emails[0]}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cpDetail.externalLinks.emails[0]}
                </a>
              )}
              {cpDetail?.externalLinks?.phones[0] && (
                <a
                  href={`tel:${cpDetail.externalLinks.phones[0]}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cpDetail.externalLinks.phones[0]}
                </a>
              )}
              {cpDetail?.externalLinks?.address && (
                <p className="text-sm text-muted-foreground">
                  {cpDetail.externalLinks.address}
                </p>
              )}
            </div>
          )}
        </div>

        {cpDetail?.copyright && (
          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">{cpDetail.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
