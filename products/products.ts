import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getProducts = api(
  { method: "GET", path: "/products", expose: true },
  async (): Promise<GetProductsResponse> => {
    const products = await db.selectFrom("Products").selectAll().execute();
    return { message: "Products obtained successfully", products };
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
    name,
  }: {
    description: string;
    is_active: boolean;
    images: string[];
    model_id: number;
    brand_id: number | null;
    name: string;
  }): Promise<CreateProductResponse> => {
    await db
      .insertInto("Products")
      .values({
        description,
        is_active,
        images,
        model_id,
        brand_id,
        name,
      })
      .executeTakeFirst();

    const formattedProduct = {
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
