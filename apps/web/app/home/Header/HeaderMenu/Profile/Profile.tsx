"use client"
import { useState } from "react"
import ProfileEdit from "../ProfileEdit/ProfileEdit"
import ProfileView from "../ProfileView/ProfileView"
import type { Profile } from "@ethos/shared"
import Spinner from "../../../components/Spinner"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"


export default function Profile() {
  const [mode, setMode] = useState<'view' | 'edit'>('view')

  const queryClient = useQueryClient()

  const { data: profile, isPending } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetch("/api/profiles").then(r => r.json()).then(d => d.profile),
  })

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
  mutationFn: async (updated: Profile & { file?: File }) => {
    let avatarURL = updated.avatarURL

    if (updated.file) {
      const formData = new FormData()
      formData.append("avatar", updated.file)
      const { avatarURL: uploadedURL } = await fetch("/api/profiles/avatar", {
        method: "POST",
        body: formData,
      }).then(r => r.json())
      avatarURL = uploadedURL
    }

    return fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updated, avatarURL }),
    }).then(r => r.json()).then(d => d.savedProfile)
  },
  onSuccess: (savedProfile) => {
    queryClient.setQueryData(["profile"], savedProfile)
    setMode("view")
  }
})


  return (
    <>
      {mode === "edit" ?
        <ProfileEdit
          profile={profile}
          loading={isPending}
          onSave={(updated: Profile, file?: File) => {
            saveProfile({...updated, file})
          }}
          onCancel={() => setMode('view')}
        /> :
        isPending ?
          <Spinner /> :
          <ProfileView
            profile={profile}
            onEdit={() => setMode("edit")} />
      }
    </>
  )
}