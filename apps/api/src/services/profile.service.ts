import type { Profile } from "@ethos/shared";
import { withTransaction } from "./withTransaction";
import * as profileRepo from "../repos/profile.repo";

type SaveProfileInput = {
  userId: string;
  avatarURL: string;
  fullName: string;
  bio: string;
};

export async function getProfile(userId: string): Promise<Profile> {
  return profileRepo.getProfileByUserId(userId);
}

export async function saveProfile(input: SaveProfileInput): Promise<Profile> {
  return withTransaction(async (client) => {
    return profileRepo.upsertProfile(input, client);
  });
}
