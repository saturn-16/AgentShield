"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/validators";
import { Settings, Key, Bell, Shield, Clipboard, RefreshCw, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || ""
    }
  });

  const onSubmitProfile = (data: { full_name: string; email: string }) => {
    if (user) {
      setUser({ ...user, ...data });
      alert("Settings preferences updated.");
    }
  };

  const handleGenerateKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      