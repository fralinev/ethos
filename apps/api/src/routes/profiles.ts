import { Router } from "express";
import * as profileService from "../services/profile.service";

export const profilesRouter = Router();


profilesRouter.get("/:userId", async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { params } = req;
    if (params.userId !== requesterId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const profile = await profileService.getProfile(requesterId);
    res.json({ message: "Success", profile })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Unknown" })
  }
})

profilesRouter.post("/", async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { body } = req;
    const { avatarURL, fullName, bio } = body;

    const savedProfile = await profileService.saveProfile({
      userId: requesterId,
      avatarURL,
      fullName,
      bio
    });
    res.json({ message: "Success", savedProfile })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Unknown" })

  }
})
