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
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">
              <Link href={templateUrl("/")}>{cpDetail?.name}</Link>
            </h3>
            <p>{cpDetail?.description}</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul>
              {menus.map((menu: MenuItem) => (
                <li key={menu._id}>
                  <Link
                    href={templateUrl(menu.url || "/")}
                    className="hover:underline"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-lg font-semibold mb-2">Contact Us</h4>
            <p>Email: {cpDetail?.externalLinks?.emails[0]}</p>
            <p>Phone: {cpDetail?.externalLinks?.phones[0]}</p>
            <p>Address: {cpDetail?.externalLinks?.address} </p>
            <div className="flex space-x-4">
              {cpDetail?.externalLinks?.facebook && (
                <a
                  href={cpDetail?.externalLinks?.facebook}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {" "}
                  <Facebook />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.twitter && (
                <a
                  href={cpDetail?.externalLinks?.twitter}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {" "}
                  <Twitter />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.linkedin && (
                <a
                  href={cpDetail?.externalLinks?.linkedin}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {" "}
                  <Linkedin />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.youtube && (
                <a
                  href={cpDetail?.externalLinks?.youtube}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {" "}
                  <Youtube />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.instagram && (
                <a
                  href={cpDetail?.externalLinks?.instagram}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {" "}
                  <Instagram />{" "}
                </a>
              )}
              {cpDetail?.externalLinks?.whatsapp && (
                <a
                  href={cpDetail?.externalLinks?.whatsapp}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  {" "}
                  <MessageCircle />{" "}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>{cpDetail?.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
