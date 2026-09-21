"use client";

import { GET_FORM_DETAIL } from "../../../graphql/queries";
import { Section } from "../../../types/sections";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import DynamicForm from "../../../components/common/DynamicForm";
import { FORM_SUBMISSION } from "../../../graphql/mutations";

const FormSection = ({ section }: { section: Section }) => {
  const [submitted, setSubmitted] = useState(false);
  const { data } = useQuery(GET_FORM_DETAIL, {
    variables: {
      id: section.contentTypeId,
    },
  });

  console.log(data, "data");
  const formData = data?.cpFormDetail || {};
  const [submitForm] = useMutation(FORM_SUBMISSION, {
    onCompleted: (data) => {
      console.log(data);
      setSubmitted(true);
    },
  });

  return (
    <section id="contact" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          {section.config?.title || "Contact Us"}
        </h2>
        <p className="text-center mb-12 text-muted-foreground">
          {section.config?.description ||
            "Feel free to reach out to us by filling the form below."}
        </p>
        <div className=" max-w-[600px] mx-auto">
          <DynamicForm
            formData={formData}
            submitForm={submitForm}
            submitted={submitted}
            successMessage={section.config?.successMessage}
          />
        </div>
      </div>
    </section>
  );
};

export default FormSection;
