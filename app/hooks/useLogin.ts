// app/hooks/useLogin.ts

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function useLogin() {
  const [companyId, setCompanyId] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({company_id: companyId, user_id: userId, password: password}),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials. Please check your Company ID, User ID, and Password.");
      } else {
        Cookies.set("token", data.token, {
          expires: 1,
          path: "/",
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production"
        });
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return {
    companyId,
    setCompanyId,
    userId,
    setUserId,
    password,
    setPassword,
    error,
    handleSubmit,
  };
}
