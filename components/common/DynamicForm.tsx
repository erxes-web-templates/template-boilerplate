"use client";

/* eslint-disable */

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
// Define the field interface based on the JSON structure
interface FormField {
  _id: string;
  text: string;
  type: string;
  isRequired: boolean;
  options: string[];
  validation: string | null;
  description: string | null;
  column?: number; // Optional, used for layout purposes
}

interface FormData {
  _id: string;
  fields: FormField[];
}

interface DynamicFormProps {
  formData: FormData;
  submitForm: (data: any) => void;
  submitted?: boolean; // Optional, used to indicate if the form has been submitted
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  formData,
  submitForm,
  submitted,
}) => {
  const [browserInfo, setBrowserInfo] = useState({});
  const fields = formData.fields;

  // Collect browser information on component mount
  useEffect(() => {
    const collectBrowserInfo = () => {
      return {
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
      };
    };

    setBrowserInfo(collectBrowserInfo());
  }, []);

  // Generate Zod schema dynamically based on the fields
  const generateZodSchema = () => {
    const schemaMap: Record<string, any> = {};

    fields?.forEach((field) => {
      let schema: any = z.string();

      // Handle different validation types
      if (field.validation === "email") {
        schema = z.string().email("Invalid email format");
      } else if (field.validation === "phone") {
        schema = z.string().min(5, "Invalid phone number");
      } else if (field.validation === "date") {
        schema = z.date({
          error: `${field.text} is required`,

          // invalid_type_error: "Please select a valid date",
        });
      } else if (field.validation === "datetime") {
        schema = z.date({
          error: `${field.text} is required`,
          // invalid_type_error: "Please select a valid date and time",
        });
      } else {
        // Default string validation
        schema = z.string();
      }

      // Apply required/optional logic
      if (field.isRequired) {
        if (field.validation === "date" || field.validation === "datetime") {
          // Date fields are already required by default with z.date()
          schema = schema;
        } else if (
          field.validation === "email" ||
          field.validation === "phone"
        ) {
          // Email and phone already have their validation, just add required
          schema = schema.min(1, `${field.text} is required`);
        } else {
          // Regular string fields
          schema = schema.min(1, `${field.text} is required`);
        }
      } else {
        if (field.validation === "date" || field.validation === "datetime") {
          schema = schema.optional();
        } else {
          schema = schema.optional();
        }
      }

      // For checkboxes, use array schema
      if (field.type === "check") {
        schema = field.isRequired
          ? z.array(z.string()).min(1, "Please select at least one option")
          : z.array(z.string()).optional();
      }

      schemaMap[field._id] = schema;
    });

    return z.object(schemaMap);
  };

  const formSchema = generateZodSchema();

  // Initialize form default values
  const getDefaultValues = () => {
    const defaultValues: Record<string, any> = {};

    fields?.forEach((field) => {
      if (field.type === "check") {
        defaultValues[field._id] = [];
      } else {
        defaultValues[field._id] = "";
      }
    });

    return defaultValues;
  };

  // Initialize react-hook-form with shadcn Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Handle form submission
  const handleFormSubmit = (data: any) => {
    // Format data for the submitForm function
    const formattedData = {
      variables: {
        formId: formData._id,
        browserInfo: browserInfo,
        submissions: formData.fields.map((field: any) => ({
          _id: field._id,
          value: data[field._id],
        })),
      },
    };

    submitForm(formattedData);
  };

  if (submitted) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
        <p>Your submission has been received.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Card className="rounded-md shadow-lg">
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
          </CardHeader>
          <CardContent className=" grid grid-cols-2 gap-3 rounded-md">
            {fields?.map((field) => {
              const {
                _id,
                text,
                type,
                isRequired,
                options,
                validation,
                description,
                column,
              } = field;
              console.log(validation, text, type, "field");
              switch (type) {
                case "input":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem
                          className={`mt-0 ${
                            column && column === 2 ? `col-span-1` : `col-span-2`
                          }`}
                        >
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">
                                * {field.column}
                              </span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            {validation === "datetime" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP p")
                                    ) : (
                                      <span>Pick a date and time</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date: any) => {
                                      if (date) {
                                        // If there's already a time set, preserve it
                                        if (field.value instanceof Date) {
                                          const newDate = new Date(date);
                                          newDate.setHours(
                                            field.value.getHours()
                                          );
                                          newDate.setMinutes(
                                            field.value.getMinutes()
                                          );
                                          field.onChange(newDate);
                                        } else {
                                          // Set default time to current time
                                          const now = new Date();
                                          date.setHours(now.getHours());
                                          date.setMinutes(now.getMinutes());
                                          field.onChange(date);
                                        }
                                      }
                                    }}
                                    disabled={(date: any) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                  <div className="p-3 border-t">
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        type="time"
                                        value={
                                          field.value instanceof Date
                                            ? format(field.value, "HH:mm")
                                            : ""
                                        }
                                        onChange={(e) => {
                                          if (field.value instanceof Date) {
                                            const [hours, minutes] =
                                              e.target.value.split(":");
                                            const newDate = new Date(
                                              field.value
                                            );
                                            newDate.setHours(parseInt(hours));
                                            newDate.setMinutes(
                                              parseInt(minutes)
                                            );
                                            field.onChange(newDate);
                                          }
                                        }}
                                        className="flex-1"
                                      />
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : validation === "date" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date: any) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <Input {...field} />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                case "firstName":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem
                          className={`${
                            column && column === 2 ? `col-span-1` : `col-span-2`
                          }`}
                        >
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                case "lastName":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem
                          className={`${
                            column && column === 2 ? `col-span-1` : `col-span-2`
                          }`}
                        >
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                case "company_primaryEmail":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem
                          className={`${
                            column && column === 2 ? `col-span-1` : `col-span-2`
                          }`}
                        >
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );

                case "email":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );

                case "phone":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            <PhoneInput
                              country={"us"}
                              value={field.value}
                              onChange={field.onChange}
                              containerClass="w-full"
                              inputStyle={{
                                width: "100%",
                                height: "40px",
                                fontSize: "16px",
                                borderRadius: "4px",
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );

                case "textarea":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem
                          className={`${
                            column && column === 2 ? `col-span-1` : `col-span-2`
                          }`}
                        >
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>{description}</FormDescription>
                          )}
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );

                case "select":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={({ field }: any) => (
                        <FormItem
                          className={`${
                            column && column === 2 ? `col-span-1` : `col-span-2`
                          }`}
                        >
                          <FormLabel>
                            {text}{" "}
                            {isRequired && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          {description && (
                            <FormDescription>
                              {" "}
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: description,
                                }}
                              />
                            </FormDescription>
                          )}
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border rounded-md p-2"
                            >
                              <option value="">Select an option</option>
                              {options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );

                case "check":
                  return (
                    <FormField
                      key={_id}
                      control={form.control}
                      name={_id}
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>
                              {text}{" "}
                              {isRequired && (
                                <span className="text-red-500">*</span>
                              )}
                            </FormLabel>
                            {description && (
                              <FormDescription>{description}</FormDescription>
                            )}
                            <div className="mt-2 space-y-2">
                              {options.map((option, index) => (
                                <FormField
                                  key={index}
                                  control={form.control}
                                  name={_id}
                                  render={({ field }: any) => {
                                    return (
                                      <FormItem
                                        key={option}
                                        className="flex flex-row items-start space-x-3 space-y-0 mt-1"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              option
                                            )}
                                            onCheckedChange={(
                                              checked: boolean
                                            ) => {
                                              const currentValue =
                                                field.value || [];
                                              if (checked) {
                                                field.onChange([
                                                  ...currentValue,
                                                  option,
                                                ]);
                                              } else {
                                                field.onChange(
                                                  currentValue.filter(
                                                    (value: string) =>
                                                      value !== option
                                                  )
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {option}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  );

                default:
                  return (
                    <div key={_id} className="text-sm text-red-600">
                      Unknown field type: {type}
                    </div>
                  );
              }
            })}

            <Button type="submit" className="w-full col-span-2">
              Submit
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default DynamicForm;
