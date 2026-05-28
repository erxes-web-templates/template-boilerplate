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
                          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="sr-only">YouTube</span>
                        </a>
                      )}
                      {cpDetail?.externalLinks?.whatsapp && (
                        <a
                          href={cpDetail?.externalLinks?.whatsapp}
                          className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                          </svg>
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
