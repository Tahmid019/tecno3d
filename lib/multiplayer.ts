import { Client, Room } from "@colyseus/sdk";

const client = new Client(
  process.env.NEXT_PUBLIC_MULTIPLAYER_URL ||
    "http://192.168.8.115:2567"
);

let room: Room | null = null;
let joining: Promise<Room> | null = null;

export async function joinCampus(): Promise<Room> {
  if (room) return room;
  if (joining) return joining;

  joining = client
    .joinOrCreate("campus", { name: "Guest" })
    .then((r) => {
      room = r;
      r.onLeave(() => {
        if (room === r) room = null;
      });
      return r;
    })
    .finally(() => {
      joining = null;
    });

  return joining;
}

export function getRoom() {
  return room;
}

export async function leaveCampus() {
  if (!room) return;

  const r = room;
  room = null;
  await r.leave();
}