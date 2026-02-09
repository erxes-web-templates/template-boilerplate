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
    variables: {
      clientPortalId: cpDetail._id,
      kind: "footer",
    },
  });

  const menus = data?.cmsMenuList || [];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link href={templateUrl("/")} className="text-lg font-semibold">
              {cpDetail?.name}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {cpDetail?.description}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4">Quick Links</h4>
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
          <div>
            <h4 className="text-sm font-medium mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {cpDetail?.externalLinks?.emails[0] && (
                <p>{cpDetail?.externalLinks?.emails[0]}</p>
              )}
              {cpDetail?.externalLinks?.phones[0] && (
                <p>{cpDetail?.externalLinks?.phones[0]}</p>
              )}
              {cpDetail?.externalLinks?.address && (
                <p>{cpDetail?.externalLinks?.address}</p>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              {cpDetail?.externalLinks?.facebook && (
                <a
                  href={cpDetail?.externalLinks?.facebook}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {cpDetail?.externalLinks?.twitter && (
                <a
                  href={cpDetail?.externalLinks?.twitter}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {cpDetail?.externalLinks?.linkedin && (
                <a
                  href={cpDetail?.externalLinks?.linkedin}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {cpDetail?.externalLinks?.youtube && (
                <a
                  href={cpDetail?.externalLinks?.youtube}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {cpDetail?.externalLinks?.instagram && (
                <a
                  href={cpDetail?.externalLinks?.instagram}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {cpDetail?.externalLinks?.whatsapp && (
                <a
                  href={cpDetail?.externalLinks?.whatsapp}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">{cpDetail?.copyright}</p>
        </div>
      </div>
    </footer>
  );
}