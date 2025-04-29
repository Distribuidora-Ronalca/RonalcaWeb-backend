import { api } from "encore.dev/api";
import { db } from "../database/database";
import { APIError, ErrCode } from "encore.dev/api";

export const getAllModels = api(
  { method: "GET", path: "/models/all", expose: true },
  async (): Promise<GetAllModelsResponse> => {
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
    try {
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
    } catch (error: any) {
      if (error.code === "23505" && error.constraint === "models_name_unique") {
        throw APIError.alreadyExists(
          `A model with the name '${name}' already exists`
        );
      }
      throw error;
    }
  }
);

export const getPaginatedModels = api(
  { method: "GET", path: "/models", expose: true },
  async ({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<Model>> => {
    const models = await db
      .selectFrom("Models")
      .selectAll()
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();
    const totalItems = await db
      .selectFrom("Models")
      .select(({ fn }) => [fn.count("id").as("totalItems")])
      .executeTakeFirst();
    if (!totalItems) {
      return {
        message: "No models found",
        paginate: { pages: 0, totalItems: 0, totalPages: 0, limit, page },
        items: [],
      };
    }
    const totalPages = Math.ceil(Number(totalItems.totalItems) / limit);
    const pages = Math.ceil(models.length / limit);
    return {
      message: "Models obtained successfully",
      paginate: {
        pages,
        totalItems: Number(totalItems.totalItems),
        totalPages,
        limit,
        page,
      },
      items: models,
    };
  }
);

interface Model {
  id: number;
  description: string;
  image: string;
  is_active: boolean;
  name: string;
}

interface PaginatedResponse<T> {
  message: string;
  paginate: {
    pages: number;
    totalItems: number;
    totalPages: number;
    limit: number;
    page: number;
  };
  items: T[];
}

interface GetAllModelsResponse {
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
