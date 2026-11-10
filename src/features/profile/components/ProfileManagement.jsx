"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserCheck, AlertCircle, Loader2 } from "lucide-react";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";
import { fetchProfile, updateProfile } from "../services/profileService";

export default function ProfileManagement() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    fetchProfile()
      .then((res) => {
        if (!isCancelled) {
          if (res.success) {
            setProfile(res.data);
          } else {
            setError(res.message || "Gagal memuat profil.");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleProfileUpdated = useCallback(async (data) => {
    const res = await updateProfile(data);
    if (res.success && res.data) {
      setProfile((prev) => ({
        ...prev,
        ...res.data,
      }));
    }
    return res;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 text-[#858095]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6D28D9]" />
        <span className="text-sm font-medium">Memuat data profil...</span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm">Gagal Mengakses Profil</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#27233A]">
              Profil Pengguna
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Akun Terverifikasi
            </span>
          </div>
          <p className="text-[13px] text-[#858095] mt-1">
            Kelola informasi akun dan pengaturan keamanan administrator.
          </p>
        </div>
      </div>

      {/* Section 1: Profile Information */}
      <ProfileForm user={profile} onProfileUpdated={handleProfileUpdated} />

      {/* Section 2: Account Security */}
      <PasswordForm />
    </div>
  );
}
