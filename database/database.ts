import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Database } from "./types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const database = new SQLDatabase("database", {
  migrations: "./migrations",
});

const connStr = database.connectionString;

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: connStr }),
});

export const db = new Kysely<Database>({
  dialect,
});
