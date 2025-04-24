import { api } from "encore.dev/api";
import { db } from "../database/database";

export const getBrands = api(
  { method: "GET", path: "/brands", expose: true },
  async (): Promise<GetBrandsResponse> => {
    const brands = await db.selectFrom("Brands").selectAll().execute();
    return { message: "Brands obtained successfully", brands };
  }
);

export const createBrand = api(
  { method: "POST", path: "/brands", expose: true },
  async ({
    description,
    logo_image,
    is_active,
    name,
  }: {
    description: string;
    logo_image: string;
    is_active: boolean;
    name: string;
  }): Promise<CreateBrandResponse> => {
    await db
      .insertInto("Brands")
      .values({
        description,
        logo_image,
        is_active,
        name,
      })
      .executeTakeFirst();
    const formattedBrand = {
      description,
      logo_image,
      is_active,
      name,
    };
    return { message: "Brand created successfully", brand: formattedBrand };
  }
);

interface GetBrandsResponse {
  message: string;
  brands: {
    id: number;
    description: string;
    logo_image: string;
    is_active: boolean;
    name: string;
  }[];
}

interface CreateBrandResponse {
  message: string;
  brand: {
    description: string;
    logo_image: string;
    is_active: boolean;
    name: string;
  };
}
