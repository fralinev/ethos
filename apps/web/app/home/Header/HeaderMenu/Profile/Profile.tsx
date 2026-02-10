"use client"
import { useState, useEffect } from "react"
import ProfileEdit from "../ProfileEdit/ProfileEdit"
import ProfileView from "../ProfileView/ProfileView"
import type { Profile } from "@ethos/shared"
import Spinner from "../../../components/Spinner"


export default function Profile() {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    avatarURL: "",
    bio: ""
  })

  useEffect(() => {
    setLoading(true)
    async function getProfile() {
      try {
        const response = await fetch("/api/profiles")
        const data = await response.json();
        setProfile(data.profile)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [])

  const handleSave = async (profile: Profile) => {

    try {
      setLoading(true)
      const response = await fetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify(profile)
      })
      const { savedProfile } = await response.json();
      setProfile(savedProfile)
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
          onSave={(updated: Profile) => {
            handleSave(updated)
            setMode('view')
          }}
          onCancel={() => setMode('view')}
        /> : loading ? <Spinner /> :
          <ProfileView
            profile={profile}
            setMode={() => setMode('edit')} />


      }
    </>
  )
}