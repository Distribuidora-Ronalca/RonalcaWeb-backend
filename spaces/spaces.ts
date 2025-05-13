import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getAllSpaces = api(
  { method: "GET", path: "/spaces/all", expose: true },
  async (): Promise<GetAllSpacesResponse> => {
    const spaces = await db.selectFrom("Spaces").selectAll().execute();
    return { message: "Spaces obtained successfully", spaces };
  }
);

export const createSpace = api(
  { method: "POST", path: "/spaces", expose: true },
  async ({
    description,
    image,
    name,
  }: {
    description: string;
    image: string;
    name: string;
  }): Promise<CreateSpaceResponse> => {
    await db
      .insertInto("Spaces")
      .values({
        description,
        image,
        name,
      })
      .executeTakeFirst();
    const formattedSpace = {
      description,
      image,
      name,
    };
    return { message: "Space created successfully", space: formattedSpace };
  }
);

interface GetAllSpacesResponse {
  message: string;
  spaces: { id: number; description: string; image: string; name: string }[];
}

interface CreateSpaceResponse {
  message: string;
  space: { description: string; image: string; name: string };
}
