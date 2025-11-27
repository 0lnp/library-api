import { randomBytes } from "node:crypto";

export type ID = `${string}:${string}:${number}`;

export function generateEntityID(entityType: string): ID {
  if (!entityType) {
    throw new Error("Entity type is required");
  }

  const randStr = randomBytes(8).toString("hex");
  const time = +new Date();
  return `${entityType}:${randStr}:${time}`;
}
