import { api } from "encore.dev/api";
import { database } from "../database/database";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "../database/types";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: database.connectionString
  }),
});

export const db = new Kysely<Database>({
  dialect,
});

export const getAllProjects = api(
  { method: "GET", path: "/projects/all", expose: true },
  async (): Promise<GetProjectsResponse> => {
    const projects = await db.selectFrom("Projects").selectAll().execute();
    return { message: "Projects obtained successfully", projects };
  }
);

export const createProject = api(
  { method: "POST", path: "/projects", expose: true },
  async ({
    description,
    image,
    location,
    name,
  }: {
    description: string;
    image: string;
    location: string;
    name: string;
  }): Promise<CreateProjectResponse> => {
    await db
      .insertInto("Projects")
      .values({
        description,
        image,
        location,
        name,
      })
      .executeTakeFirst();
    const formattedProject = {
      description,
      image,
      location,
      name,
    };
    return {
      message: "Project created successfully",
      project: formattedProject,
    };
  }
);

interface GetProjectsResponse {
  message: string;
  projects: {
    id: number;
    description: string;
    image: string;
    location: string;
    name: string;
  }[];
}

interface CreateProjectResponse {
  message: string;
  project: {
    description: string;
    image: string;
    location: string;
    name: string;
  };
}
