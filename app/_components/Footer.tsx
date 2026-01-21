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
    <footer
      className="text-current"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--primary)",
      }}
    >
      <div
        className="container mx-auto px-4 py-12"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="flex flex-wrap gap-10">
          <div className="w-full md:w-1/3">
            <h3
              className="text-2xl font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Link href={templateUrl("/")}>{cpDetail?.name}</Link>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-current opacity-70">
              {cpDetail?.description}
            </p>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-current opacity-70">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {menus.map((menu: MenuItem) => (
                <li key={menu._id}>
                  <Link
                    href={templateUrl(menu.url || "/")}
                    className="transition hover:text-[color:var(--accent)]"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-current opacity-70">
              Contact
            </h4>
            <div className="mt-4 space-y-2 text-sm text-current opacity-70">
              <p>Email: {cpDetail?.externalLinks?.emails[0]}</p>
              <p>Phone: {cpDetail?.externalLinks?.phones[0]}</p>
              <p>Address: {cpDetail?.externalLinks?.address}</p>
            </div>
            <div className="mt-5 flex items-center gap-3">
              {cpDetail?.externalLinks?.facebook && (
                <a
                  href={cpDetail?.externalLinks?.facebook}
                  className="rounded-full border p-2 transition hover:text-[color:var(--accent)]"
                  style={{ borderColor: "var(--accent)" }}
                >
                  {" "}
                  <Facebook />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.twitter && (
                <a
                  href={cpDetail?.externalLinks?.twitter}
                  className="rounded-full border p-2 transition hover:text-[color:var(--accent)]"
                  style={{ borderColor: "var(--accent)" }}
                >
                  {" "}
                  <Twitter />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.linkedin && (
                <a
                  href={cpDetail?.externalLinks?.linkedin}
                  className="rounded-full border p-2 transition hover:text-[color:var(--accent)]"
                  style={{ borderColor: "var(--accent)" }}
                >
                  {" "}
                  <Linkedin />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.youtube && (
                <a
                  href={cpDetail?.externalLinks?.youtube}
                  className="rounded-full border p-2 transition hover:text-[color:var(--accent)]"
                  style={{ borderColor: "var(--accent)" }}
                >
                  {" "}
                  <Youtube />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.instagram && (
                <a
                  href={cpDetail?.externalLinks?.instagram}
                  className="rounded-full border p-2 transition hover:text-[color:var(--accent)]"
                  style={{ borderColor: "var(--accent)" }}
                >
                  {" "}
                  <Instagram />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.whatsapp && (
                <a
                  href={cpDetail?.externalLinks?.whatsapp}
                  className="rounded-full border p-2 transition hover:text-[color:var(--accent)]"
                  style={{ borderColor: "var(--accent)" }}
                >
                  {" "}
                  <MessageCircle />{" "}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-xs uppercase tracking-[0.35em] text-current opacity-60"
          style={{ borderColor: "var(--accent)" }}
        >
          <p>{cpDetail?.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
