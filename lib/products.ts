import { createClient } from "./server";

export async function getProducts(
  search?: string,
  category?: string
) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      description,
      featured,
      active,
      category:categories!inner (
        id,
        name
      ),
      images:product_images (
        id,
        image_url,
        alt_text,
        sort_order,
        is_primary,
        design_id
      ),
      sizes:product_sizes (
        id,
        size
      ),
      designs:product_designs (
        id,
        name,
        description
      )
    `)
    .eq("active", true);

  const searchTerm = search?.trim();
  const categoryTerm = category?.trim();

  // Search by product name, slug or description
  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  // Filter by category
 // Filter by category
if (categoryTerm) {
  const isCategoryId = /^\d+$/.test(categoryTerm);

  if (isCategoryId) {
    // Shop by Category sends the database category ID
    query = query.eq("category_id", categoryTerm);
  } else {
    // Header sends the category name, such as "coats"
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", categoryTerm)
      .maybeSingle();

    if (categoryError) {
      console.error("Error finding category:", categoryError);
      return [];
    }

    if (!categoryData) {
      return [];
    }

    query = query.eq("category_id", categoryData.id);
  }
}

  const { data, error } = await query.order("id", {
    ascending: true,
  });

  if (error) {
    console.error(
      "Error fetching products:",
      error.message,
      error.code,
      error.details,
      error.hint
    );

    throw new Error("Unable to load products");
  }

  return data;
}

export async function getProductById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      description,
      featured,
      active,
      category:categories (
        id,
        name
      ),
      images:product_images (
        id,
        image_url,
        alt_text,
        sort_order,
        is_primary,
        design_id
      ),
      sizes:product_sizes (
        id,
        size
      ),
      designs:product_designs (
        id,
        name,
        description
      )
    `)
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Error fetching product:",
      error.message,
      error.code,
      error.details,
      error.hint
    );

    throw new Error("Unable to load product");
  }

  return data;
}