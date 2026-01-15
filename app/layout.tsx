import type { Metadata } from "next";
import "./globals.css";
import data from "../data/configs.json";
import ClientShell from "./_components/ClientShell";
import { fetchCpConfig } from "../lib/fetchCpConfig";
import { isBuildMode } from "../lib/buildMode";
import type { CPDetail } from "../types/cms";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
};

const fallbackCpDetail = (): CPDetail => {
  const socials = data.additional?.social || [];
  const findSocial = (name: string) =>
    socials.find((item: { name: string }) => item.name === name)?.url;

  return {
    _id: data.cpId || "local",
    name: data.meta.title,
    description: data.meta.description,
    copyright: data.additional?.copyright?.text || "",
    logo: data.meta.logo || "",
    styles: {
      baseColor: data.appearance.baseColor,
      backgroundColor: data.appearance.backgroundColor,
      headingFont: data.appearance.headingFont,
      baseFont: data.appearance.baseFont,
    },
    externalLinks: {
      phones: (findSocial("phones") as string[]) || [],
      emails: (findSocial("emails") as string[]) || [],
      address: (findSocial("address") as string) || "",
      twitter: (findSocial("twitter") as string) || "",
      facebook: (findSocial("facebook") as string) || "",
      linkedin: (findSocial("linkedin") as string) || "",
      whatsapp: (findSocial("whatsapp") as string) || "",
      instagram: (findSocial("instagram") as string) || "",
      youtube: (findSocial("youtube") as string) || "",
    },
  };
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cpDetail = isBuildMode()
    ? fallbackCpDetail()
    : (await fetchCpConfig(data.cpId)) || fallbackCpDetail();

  return (
    <html lang="en">
      <body>
        <ClientShell cpDetail={cpDetail}>{children}</ClientShell>
        <Toaster />
      </body>
    </html>
  );
}
