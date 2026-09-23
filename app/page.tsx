"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [health, setHealth] = useState("checking...");
  useEffect(() => {
    api<{ status: string }>("/health")
      .then((d) => setHealth(JSON.stringify(d)))
      .catch((e) => setHealth("ERROR: " + e.message));
  }, []);
  return <main className="p-8">Backend: {health}</main>;
}