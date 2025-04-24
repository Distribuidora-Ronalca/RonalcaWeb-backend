-- Subsidiaries Table
CREATE TABLE "Subsidiaries"(
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    CONSTRAINT "subsidiaries_email_unique" UNIQUE ("email")
);

-- Brands Table
CREATE TABLE "Brands"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo_image" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Models Table
CREATE TABLE "Models"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Spaces Table
CREATE TABLE "Spaces"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Products Table
CREATE TABLE "Products"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "images" TEXT[] NOT NULL,
    "model_id" INTEGER NOT NULL,
    "brand_id" INTEGER NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    CONSTRAINT "products_name_unique" UNIQUE ("name"),
    CONSTRAINT "products_brand_id_foreign" FOREIGN KEY ("brand_id") REFERENCES "Brands"("id"),
    CONSTRAINT "products_model_id_foreign" FOREIGN KEY ("model_id") REFERENCES "Models"("id")
);

-- Products in Spaces Table
CREATE TABLE "Products in Spaces"(
    "product_id" INTEGER UNIQUE NOT NULL,
    "space_id" INTEGER UNIQUE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("product_id", "space_id"),
    CONSTRAINT "products_in_spaces_products_id_foreign" FOREIGN KEY ("product_id") REFERENCES "Products"("id"),
    CONSTRAINT "products_in_spaces_space_id_foreign" FOREIGN KEY ("space_id") REFERENCES "Spaces"("id")
);

-- Projects Table
CREATE TABLE "Projects"(
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    CONSTRAINT "projects_name_unique" UNIQUE ("name")
);
