"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ErxesFormStep = {
  name?: string;
  description?: string;
  order: number;
};

type ErxesLeadData = {
  thankTitle?: string;
  thankContent?: string;
  steps?: Record<string, ErxesFormStep>;
};

type ErxesField = {
  _id: string;
  text: string;
  type: string;
  isRequired?: boolean;
  options?: string[];
  validation?: string | null;
  description?: string | null;
  column?: number | null;
  pageNumber?: number | null;
  order?: number | null;
};

const getFieldWidth = (field: ErxesField) => {
  const width = Number(field.column ?? 1);

  if (width === 2) {
    return 2;
  }

  return 1;
};

type FormData = {
  _id?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  numberOfPages?: number;
  leadData?: ErxesLeadData | null;
  fields?: ErxesField[];
};

type DynamicFormProps = {
  formData: FormData;
  submitForm: (data: {
    variables: {
      formId: string;
      browserInfo: Record<string, unknown>;
      submissions: Array<{ _id: string; value: unknown }>;
    };
  }) => Promise<unknown>;
  submitted?: boolean;
  successMessage?: string;
};

const getFieldType = (field: ErxesField) => {
  if (field.type === "input") {
    if (field.validation === "date" || field.validation === "datetime") {
      return "date";
    }

    return field.validation === "email" ? "email" : "text";
  }

  return field.type;
};

const getFieldSpan = (field: ErxesField) =>
  getFieldWidth(field) === 2 ? "md:col-span-2" : "md:col-span-1";

const getDefaultValue = (field: ErxesField) => {
  const type = getFieldType(field);

  if (type === "check") {
    return [];
  }

  if (type === "boolean") {
    return false;
  }

  if (type === "date") {
    return undefined;
  }

  return "";
};

const buildFieldSchema = (field: ErxesField) => {
  const type = getFieldType(field);
  const label = field.text || "This field";

  if (type === "check") {
    const schema = z.array(z.string());
    return field.isRequired
      ? schema.min(1, `Please select at least one option for ${label}`)
      : schema.optional().default([]);
  }

  if (type === "boolean") {
    return field.isRequired
      ? z.boolean().refine((value) => value, {
          message: `${label} is required`,
        })
      : z.boolean().default(false);
  }

  if (type === "number") {
    const schema = z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    }, z.number({ invalid_type_error: `${label} must be a number` }));

    return field.isRequired
      ? schema
      : schema.optional();
  }

  if (type === "date") {
    const schema = z.date({
      required_error: `${label} is required`,
      invalid_type_error: `Please select a valid date for ${label}`,
    });

    return field.isRequired ? schema : schema.optional();
  }

  let schema = z.string();

  if (type === "email" || field.validation === "email") {
    schema = z.string().email("Invalid email format");
  }

  if (field.validation === "phone") {
    schema = z.string().min(5, "Invalid phone number");
  }

  return field.isRequired
    ? schema.min(1, `${label} is required`)
    : schema.optional().or(z.literal(""));
};

export default function DynamicForm({
  formData,
  submitForm,
  submitted,
  successMessage,
}: DynamicFormProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [browserInfo, setBrowserInfo] = useState<Record<string, unknown>>({});
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fields = useMemo(
    () =>
      [...(formData.fields || [])].sort(
        (a, b) =>
          (a.pageNumber ?? 1) - (b.pageNumber ?? 1) ||
          (a.order ?? 0) - (b.order ?? 0),
      ),
    [formData.fields],
  );

  const steps = useMemo(() => {
    const configuredSteps = Object.values(formData.leadData?.steps || {}).sort(
      (a, b) => a.order - b.order,
    );

    if (configuredSteps.length > 0) {
      return configuredSteps;
    }

    const maxPageNumber = fields.reduce(
      (max, field) => Math.max(max, field.pageNumber ?? 1),
      1,
    );

    return Array.from({ length: maxPageNumber }, (_, index) => ({
      order: index + 1,
      name: maxPageNumber > 1 ? `Step ${index + 1}` : "",
      description: "",
    }));
  }, [fields, formData.leadData?.steps]);

  const fieldsByStep = useMemo(
    () =>
      steps.map((step) => ({
        ...step,
        fields: fields.filter((field) => (field.pageNumber ?? 1) === step.order),
      })),
    [fields, steps],
  );

  const formSchema = useMemo(() => {
    const schemaMap: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      schemaMap[field._id] = buildFieldSchema(field);
    });

    return z.object(schemaMap);
  }, [fields]);

  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = {};

    fields.forEach((field) => {
      values[field._id] = getDefaultValue(field);
    });

    return values;
  }, [fields]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const currentStep = fieldsByStep.find((step) => step.order === activeStep);
  const isLastStep = activeStep === fieldsByStep.length;
  const hasSubmitted = submitted || internalSubmitted;

  useEffect(() => {
    form.reset(defaultValues);
    setActiveStep(1);
    setInternalSubmitted(false);
  }, [defaultValues, form, formData._id]);

  useEffect(() => {
    setBrowserInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleNext = async () => {
    if (!currentStep) {
      return;
    }

    const isValid = await form.trigger(
      currentStep.fields.map((field) => field._id),
    );

    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, fieldsByStep.length));
    }
  };

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    if (!formData._id) {
      return;
    }

    setSubmitting(true);

    try {
      await submitForm({
        variables: {
          formId: formData._id,
          browserInfo,
          submissions: fields.map((field) => ({
            _id: field._id,
            value: values[field._id],
          })),
        },
      });

      setInternalSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!formData._id || fields.length === 0) {
    return null;
  }

  if (hasSubmitted) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <h2 className="text-2xl font-semibold mb-3">
          {formData.leadData?.thankTitle || "Thank you!"}
        </h2>
        <p className="text-muted-foreground">
          {successMessage ||
            formData.leadData?.thankContent ||
            "Your submission has been received."}
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Card className="rounded-md shadow-lg">
          <CardHeader>
            <CardTitle>{formData.title || "Contact Form"}</CardTitle>
            {formData.description ? (
              <p className="text-sm text-muted-foreground">
                {formData.description}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6">
            {fieldsByStep.length > 1 && currentStep ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Step {activeStep} of {fieldsByStep.length}
                </p>
                {currentStep.name ? (
                  <h3 className="text-lg font-semibold">{currentStep.name}</h3>
                ) : null}
                {currentStep.description ? (
                  <p className="text-sm text-muted-foreground">
                    {currentStep.description}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(currentStep?.fields || fields).map((schemaField) => (
                <FormField
                  key={schemaField._id}
                  control={form.control}
                  name={schemaField._id}
                  render={({ field }) => (
                    <FormItem className={getFieldSpan(schemaField)}>
                      <FormLabel>
                        {schemaField.text}
                        {schemaField.isRequired ? (
                          <span className="text-destructive ml-1">*</span>
                        ) : null}
                      </FormLabel>
                      {schemaField.description ? (
                        <FormDescription>{schemaField.description}</FormDescription>
                      ) : null}
                      <FormControl>
                        <DynamicFormControl
                          field={schemaField}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-2">
              {fieldsByStep.length > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                  disabled={activeStep === 1 || submitting}
                >
                  Previous
                </Button>
              ) : null}

              {isLastStep ? (
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Submitting..."
                    : formData.buttonText || "Submit"}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} disabled={submitting}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

function DynamicFormControl({
  field,
  value,
  onChange,
}: {
  field: ErxesField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const type = getFieldType(field);

  if (type === "textarea") {
    return <Textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.text} />;
  }

  if (type === "number") {
    return (
      <Input
        type="number"
        value={value === undefined || value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.text}
      />
    );
  }

  if (type === "boolean") {
    return (
      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
        />
        <span className="text-sm text-muted-foreground">{field.text}</span>
      </div>
    );
  }

  if (type === "select") {
    return (
      <Select value={(value as string) || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={field.text} />
        </SelectTrigger>
        <SelectContent>
          {(field.options || []).filter(Boolean).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "radio") {
    return (
      <RadioGroup
        value={(value as string) || ""}
        onValueChange={onChange}
        className="gap-3 pt-2"
      >
        {(field.options || []).filter(Boolean).map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <RadioGroupItem value={option} />
            <span>{option}</span>
          </label>
        ))}
      </RadioGroup>
    );
  }

  if (type === "check") {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div className="space-y-2 pt-2">
        {(field.options || []).filter(Boolean).map((option) => {
          const checked = selectedValues.includes(option);

          return (
            <label key={option} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  onChange(
                    nextChecked
                      ? [...selectedValues, option]
                      : selectedValues.filter((item) => item !== option),
                  );
                }}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (type === "date") {
    const selectedDate = value instanceof Date ? value : undefined;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Input
      type={type === "email" ? "email" : "text"}
      value={(value as string) || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.text}
    />
  );
}
