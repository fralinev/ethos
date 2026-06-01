import { Router } from "express";
import * as profileService from "../services/profile.service";
import multer from "multer";
import { uploadAvatar } from "../utils/s3";

const upload = multer({ storage: multer.memoryStorage() });

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

profilesRouter.post("/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const avatarURL = await uploadAvatar(req.file, requesterId);
    res.json({ message: "Success", avatarURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unknown" });
  }
});
