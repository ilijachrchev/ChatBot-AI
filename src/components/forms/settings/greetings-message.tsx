"use client";

import { Section } from "@/components/section-label";
import React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import type { DomainSettingsProps } from "@/schemas/settings.schema";
import FormGenerator from "../form-generator";


export type GreetingsMessageProps = {
  message?: string | null;
  register: UseFormRegister<DomainSettingsProps>;
  errors: FieldErrors<DomainSettingsProps>;
};

const GreetingsMessage = ({ message, register, errors }: GreetingsMessageProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Section
        label="Greeting message"
        message="Customize your welcome message"
      />
       <div className="lg:w-[500px]">
        <FormGenerator
          placeholder={message ?? "Write a friednly greeting..."}
          inputType="textarea"
          lines={2}
          register={register}
          errors={errors}
          name="welcomeMessage"
          type="text"
        />
      </div>
    </div>
  );
};

export default GreetingsMessage;
