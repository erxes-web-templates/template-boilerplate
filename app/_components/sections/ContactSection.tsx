"use client";

import React, { useState } from "react";
import { Section } from "../../../types/sections";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle,
} from "lucide-react";
import DynamicForm from "../../../components/common/DynamicForm";
import { useMutation, useQuery } from "@apollo/client";
import { GET_FORM_DETAIL } from "../../../graphql/queries";
import { FORM_SUBMISSION } from "../../../graphql/mutations";
import useClientPortal from "@/hooks/useClientPortal";
import { useParams } from "next/navigation";
const parseStringOrArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return [value]; }
  }
  return [];
};

const ContactSection = ({ section }: { section: Section }) => {
  const params = useParams<{ id: string }>();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { data } = useQuery(GET_FORM_DETAIL, {
    variables: {
      id: section.config.formId,
    },
  });

  const formData = data?.cpFormDetail || {};
  const [submitForm] = useMutation(FORM_SUBMISSION, {
    onCompleted: (data) => {
      console.log(data);
    },
  });
  const { cpDetail } = useClientPortal({
    id: process.env.ERXES_WEB_ID || params.id,
  });

  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        {/* Contact Information */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {section.config.title}
          </h1>
          {section.config.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {section.config.description}
            </p>
          )}
        </div>
        <div>
          <Card>
            <div className="grid md:grid-cols-2 gap-8 pt-6 ">
              <div>
                <CardContent className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mr-4 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Our Location</h3>
                      <p className="text-muted-foreground">
                        {cpDetail?.externalLinks?.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-6 w-6 text-primary mr-4 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone Number</h3>
                      <p className="text-muted-foreground">
                        {parseStringOrArray(cpDetail?.externalLinks?.phones).map(
                          (phone: string) => (
                            <a
                              href={`tel:${phone}`}
                              className="hover:text-primary block"
                              key={phone}
                            >
                              {phone}
                            </a>
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-primary mr-4 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email Address</h3>
                      <p className="text-muted-foreground">
                        {parseStringOrArray(cpDetail?.externalLinks?.emails).map(
                          (email: string) => (
                            <a
                              href={`mailto:${email}`}
                              className="hover:text-primary block"
                              key={email}
                            >
                              {email}
                            </a>
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-3">Follow Us on</h3>
                    <div className="flex space-x-4">
                      {cpDetail?.externalLinks?.facebook && (
                        <a
                          href={cpDetail?.externalLinks?.facebook}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Facebook className="h-5 w-5 text-primary" />
                          <span className="sr-only">Facebook</span>
                        </a>
                      )}
                      {cpDetail?.externalLinks?.twitter && (
                        <a
                          href={cpDetail?.externalLinks?.twitter}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Twitter className="h-5 w-5 text-primary" />
                          <span className="sr-only">Twitter</span>
                        </a>
                      )}
                      {cpDetail?.externalLinks?.instagram && (
                        <a
                          href={cpDetail?.externalLinks?.instagram}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Instagram className="h-5 w-5 text-primary" />
                          <span className="sr-only">Instagram</span>
                        </a>
                      )}
                      {cpDetail?.externalLinks?.linkedin && (
                        <a
                          href={cpDetail?.externalLinks?.linkedin}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Linkedin className="h-5 w-5 text-primary" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                      )}
                      {cpDetail?.externalLinks?.youtube && (
                        <a
                          href={cpDetail?.externalLinks?.youtube}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Linkedin className="h-5 w-5 text-primary" />
                          <span className="sr-only">YouTube</span>
                        </a>
                      )}
                      {cpDetail?.externalLinks?.whatsapp && (
                        <a
                          href={cpDetail?.externalLinks?.whatsapp}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Linkedin className="h-5 w-5 text-primary" />
                          <span className="sr-only">WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
              <div>
                <CardContent>
                  {formSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        Message Sent!
                      </h3>
                    </div>
                  ) : (
                    <DynamicForm formData={formData} submitForm={submitForm} />
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
