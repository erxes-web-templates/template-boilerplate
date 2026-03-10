"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import DynamicForm from "../../components/common/DynamicForm";
import { FORM_SUBMISSION } from "../../graphql/mutations";
import { useSearchParams } from "next/navigation";
import { INQUIRY_FORM, TOUR_GROUP_DETAIL_QUERY } from "../../graphql/queries";

export default function InquiryPage() {
  const [submitted, setSubmitted] = useState(false);
  const params = useSearchParams();
  const selectedTourId = params.get("tourId");

  const { data: groupToursData } = useQuery(TOUR_GROUP_DETAIL_QUERY, {
    variables: {
      status: "website",
      groupCode: selectedTourId || "",
    },
  });

  const groupTourItems = groupToursData?.cpBmToursGroupDetail?.items || [];

  const { data: formData } = useQuery(INQUIRY_FORM, {
    variables: {
      type: "lead",
      searchValue: "inquiry",
    },
  });

  const [submitForm] = useMutation(FORM_SUBMISSION, {
    onCompleted: (data) => {
      console.log(data);
      setSubmitted(true);
    },
  });

  const inquiryForm = formData?.forms[0] || {};

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-black">Inquiry form</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selected tour: {groupTourItems[0]?.name} (
            {groupTourItems[0]?.duration} days)
          </p>
        </div>

        <DynamicForm
          formData={inquiryForm}
          submitForm={submitForm}
          submitted={submitted}
        />
      </div>
    </div>
  );
}
