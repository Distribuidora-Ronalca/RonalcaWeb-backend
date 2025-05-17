import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Database } from "./types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

export const database = new SQLDatabase("database", {
  migrations: "./migrations",
});

const connectionString = database.connectionString;

const dialect = new PostgresDialect({
  pool: new Pool({connectionString}),
});

export const db = new Kysely<Database>({
  dialect,
});
