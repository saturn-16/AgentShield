"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/stores/auth";

import { User, UserRole } from "@/types";
import { Users, Shield, Cpu, RefreshCw, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SystemHealth {
  api_status: string;
  database_status: string;
  redis_status: string;
  celery_queue_depth: number;
  system_load: number;
}

export default function AdminPanel() {
  const { user: currentUser } = useAuthStore();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    