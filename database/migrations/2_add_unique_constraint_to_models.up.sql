-- Eliminar modelos duplicados, manteniendo el registro con el ID más alto
DELETE FROM "Models" a
USING (
    SELECT "name", MAX(id) as max_id
    FROM "Models"
    GROUP BY "name"
    HAVING COUNT(*) > 1
) b
WHERE a."name" = b."name" AND a.id < b.max_id;

-- Add unique constraint to Models.name
ALTER TABLE "Models" ADD CONSTRAINT "models_name_unique" UNIQUE ("name")
