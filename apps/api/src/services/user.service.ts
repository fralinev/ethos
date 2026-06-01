import * as userRepo from "../repos/user.repo"

export async function getUserById(userId:string) {
  return await userRepo.getUserById(userId)
}

export async function getMyUsers({requesterId, limit, offset}:any) {
  return await userRepo.getMyUsers({requesterId, limit, offset})
}
export async function getUsersByQuery({
  q,
  requesterId,
  limit,
  offset
} : {
  q: string,
  requesterId: string,
  limit: number,
  offset: number
}) {
  return await userRepo.getUsersByQuery({q, requesterId, limit, offset})
}