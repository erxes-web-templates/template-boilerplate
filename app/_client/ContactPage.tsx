"use client";

import type React from "react";
import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";

export default function ContactPage() {
  const searchParams = useSearchParams();

  const pageName = searchParams.get("pageName"); //pageName = about, tours, contact etc

  const PageContent = usePage(pageName, sectionComponents);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* <div className="mb-12">
        <Card className="overflow-hidden">
          <div className="h-[300px] w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.1234567890123!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1625000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our location"
            ></iframe>
          </div>
        </Card>
      </div> */}
      <PageContent />
    </div>
  );
}
