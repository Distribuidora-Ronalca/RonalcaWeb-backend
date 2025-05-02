import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getAllProducts = api(
  { method: "GET", path: "/products/all", expose: true },
  async (): Promise<GetProductsResponse> => {
    const products = await db.selectFrom("Products").selectAll().execute();
    return { message: "Products obtained successfully", products };
  }
);

export const getPaginatedProducts = api(
  { method: "GET", path: "/products", expose: true },
  async ({
    page,
    limit,
    brand,
    model,
    space,
    name,
  }: {
    page: number;
    limit: number;
    brand?: number;
    model?: number;
    space?: number;
    name?: string;
  }): Promise<PaginatedResponse<Product>> => {
    return db.transaction().execute(async (trx) => {
      let query = await db
        .selectFrom("Products")
        .leftJoin(
          "ProductsInSpaces",
          "Products.id",
          "ProductsInSpaces.product_id"
        )
        .leftJoin("Spaces", "ProductsInSpaces.space_id", "Spaces.id")
        .select([
          "Products.id",
          "Products.description",
          "Products.is_active",
          "Products.images",
          "Products.model_id",
          "Products.brand_id",
          "Products.name",
          "Spaces.id as space_id",
          "Spaces.name as space_name",
          "Spaces.description as space_description",
          "Spaces.image as space_image",
        ])
        .limit(limit)
        .offset((page - 1) * limit);

      if (brand) {
        query = query.where("Products.brand_id", "=", brand);
      }
      if (model) {
        query = query.where("Products.model_id", "=", model);
      }
      if (space) {
        query = query.where("Spaces.id", "=", space);
      }
      if (name) {
        query = query.where("Products.name", "ilike", `%${name}%`);
      }

      const results = await query.execute();

      const productsMap = new Map();
      results.map((row) => {
        if (!productsMap.has(row.id)) {
          productsMap.set(row.id, {
            id: row.id,
            description: row.description,
            is_active: row.is_active,
            images: row.images,
            model_id: row.model_id,
            brand_id: row.brand_id,
            name: row.name,
            spaces: [],
          });
        }

        if (row.space_id) {
          productsMap.get(row.id).spaces.push({
            id: row.space_id,
            name: row.space_name,
            description: row.space_description,
            image: row.space_image,
          });
        }
      });

      const products = Array.from(productsMap.values());

      const totalItems = await db
        .selectFrom("Products")
        .select(({ fn }) => [fn.count("id").as("totalItems")])
        .executeTakeFirst();
      if (!totalItems) {
        return {
          message: "No products found",
          paginate: { totalItems: 0, totalPages: 0, limit, page },
          items: [],
        };
      }
      const totalPages = Math.ceil(Number(totalItems.totalItems) / limit);

      return {
        message: "Products obtained successfully",
        paginate: {
          totalItems: Number(totalItems.totalItems),
          totalPages,
          limit,
          page,
        },
        items: products,
      };
    });
  }
);

export const createProduct = api(
  { method: "POST", path: "/products", expose: true },
  async ({
    description,
    is_active,
    images,
    model_id,
    brand_id,
    spacesIds,
    name,
  }: {
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    spacesIds: number[];
    name: string;
  }): Promise<CreateProductResponse> => {
    const product = await db
      .insertInto("Products")
      .values({
        description,
        is_active,
        images,
        model_id,
        brand_id,
        name,
      })
      .returning(["id", "name"])
      .executeTakeFirstOrThrow();

    await db
      .insertInto("ProductsInSpaces")
      .values(
        spacesIds.map((spaceId) => ({
          product_id: product.id,
          space_id: spaceId,
        }))
      )
      .returning(["product_id", "space_id"])
      .execute();

    const formattedProduct = {
      id: product.id,
      description,
      is_active,
      images,
      model_id,
      brand_id,
      name,
    };
    return {
      message: "Product created successfully",
      product: formattedProduct,
    };
  }
);

interface GetProductsResponse {
  message: string;
  products: {
    id: number;
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  }[];
}

interface Product {
  id: number;
  description: string;
  is_active: boolean;
  images: string[];
  model_id: number;
  brand_id: number | null;
  name: string;
  spaces: {
    id: number;
    name: string;
    description: string;
    image: string;
  }[];
}
interface PaginatedResponse<T> {
  message: string;
  paginate: {
    totalItems: number;
    totalPages: number;
    limit: number;
    page: number;
  };
  items: T[];
}

interface CreateProductResponse {
  message: string;
  product: {
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  };
}
