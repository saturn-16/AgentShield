"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validators";
import { Shield, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { gsapUtils } from "@/lib/gsap";

export default function Login() {
  const router = useRouter();
  const { login, isLoading, user } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    gsapUtils.animateIn(".login-card", 0.1);
  }, []);

  useEffect(() => {
    