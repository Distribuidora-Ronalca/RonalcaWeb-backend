import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getModels = api(
  { method: "GET", path: "/models", expose: true },
  async (): Promise<GetModelsResponse> => {
    const models = await db.selectFrom("Models").selectAll().execute();
    return { message: "Models obtained successfully", models };
  }
);

export const createModel = api(
  { method: "POST", path: "/models", expose: true },
  async ({
    description,
    image,
    is_active,
    name,
  }: {
    description: string;
    image: string;
    is_active: boolean;
    name: string;
  }): Promise<CreateModelResponse> => {
    await db
      .insertInto("Models")
      .values({
        description,
        image,
        is_active,
        name,
      })
      .executeTakeFirst();
    const formattedModel = {
      description,
      image,
      is_active,
      name,
    };
    return { message: "Model created successfully", model: formattedModel };
  }
);

interface GetModelsResponse {
  message: string;
  models: {
    id: number;
    description: string;
    image: string;
    is_active: boolean;
    name: string;
  }[];
}

interface CreateModelResponse {
  message: string;
  model: {
    description: string;
    image: string;
    is_active: boolean;
    name: string;
  };
}
