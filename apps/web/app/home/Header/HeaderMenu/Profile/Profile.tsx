"use client"
import { useState, useEffect } from "react"
import ProfileEdit from "../ProfileEdit/ProfileEdit"
import ProfileView from "../ProfileView/ProfileView"
import type { Profile } from "@ethos/shared"
import Spinner from "../../../components/Spinner"
import { apiFetch } from "@/apps/web/lib/apiFetch"


export default function Profile() {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    avatarURL: "",
    bio: ""
  })

  console.log("profile", profile)

  useEffect(() => {
    const controller = new AbortController();

    async function getProfile() {
      try {
        setLoading(true)
        const data = await apiFetch("/api/profiles", {
          signal: controller.signal
        })
        setProfile(data.profile)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    getProfile()
    return () => {
      controller.abort();
    };
  }, [])

  const handleSave = async (profile: Profile) => {
    try {
      setLoading(true)
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      })
      if (!response.ok) throw new Error("Failed to save profile");
      const { savedProfile } = await response.json();
      setProfile(savedProfile)
      setMode("view")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {mode === "edit" ?
        <ProfileEdit
          profile={profile}
          loading={loading}
          onSave={(updated: Profile) => {
            handleSave(updated)
          }}
          onCancel={() => setMode('view')}
        /> :
        loading ?
          <Spinner /> :
          <ProfileView
            profile={profile}
            onEdit={() => setMode("edit")} />
      }
    </>
  )
}