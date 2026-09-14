"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
  active: boolean;
};

type Color = {
  id: number;
  name: string;
  hex_code: string | null;
};

type Design = {
  id: number;
  name: string;
  active: boolean;
  mapped: boolean;
};

type DuplicateProduct = {
  id: number;
  name: string;
  category_id: number;
  design_id: number | null;
};

type Size = {
  id: number;
  name: string;
  active: boolean;
  mapped: boolean;
};

const CATEGORY_CONFIG: Record<
  string,
  {
    colors: string[];
  }
> = {
  suits: {
    colors: [
      "Black",
      "Navy Blue",
      "Charcoal Grey",
      "Wine",
      "Royal Blue",
      "Emerald Green",
    ],
  },

  jodhpuri: {
    colors: [
      "Off-White / Cream",
      "Black",
      "Maroon / Wine",
      "Gold",
      "Royal Blue",
      "Mustard",
    ],
  },

  "modi jacket": {
    colors: [
      "Beige / Cream",
      "Pastel Blue",
      "Mint Green",
      "Yellow",
      "Olive",
      "Charcoal",
      "Black",
    ],
  },
};
function getCategoryKey(categoryName: string) {
  return categoryName.trim().toLowerCase();
}

function getCategoryDisplayName(categoryName: string) {
  const key = getCategoryKey(categoryName);

  if (key === "suits") {
    return "Suit";
  }

  if (key === "jodhpuri") {
    return "Jodhpuri";
  }

  if (key === "modi jacket") {
    return "Modi Jacket";
  }

  return categoryName.trim();
}

function getDesignDisplayName(designName: string) {
  const key = designName.trim().toLowerCase();

  if (key === "daman print") {
    return "Daman";
  }

  return designName.trim();
}

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [colors, setColors] =
    useState<Color[]>([]);

  const [designs, setDesigns] =
    useState<Design[]>([]);

  const [selectedDesignId, setSelectedDesignId] =
    useState<number | null>(null);

  const [loadingDesigns, setLoadingDesigns] =
    useState(false);

  const [name, setName] = useState("");
  const [categoryName, setCategoryName] =
    useState("");
  const [designName, setDesignName] =
    useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] =
    useState("");

  const [featured, setFeatured] =
    useState(false);
  const [active, setActive] =
    useState(true);

  const [availableSizes, setAvailableSizes] =
    useState<string[]>([]);

  const [loadingSizes, setLoadingSizes] =
    useState(false);

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);

  const [selectedColors, setSelectedColors] =
    useState<number[]>([]);

  const [categoryOpen, setCategoryOpen] =
    useState(false);
  const [designOpen, setDesignOpen] =
    useState(false);

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [primaryImageIndex, setPrimaryImageIndex] =
    useState(0);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingColors, setLoadingColors] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [nameManuallyEdited, setNameManuallyEdited] =
    useState(false);

  // Search text used only while browsing the Category/Design dropdowns.
  const [categoryDropdownSearch, setCategoryDropdownSearch] =
    useState("");

  const [designDropdownSearch, setDesignDropdownSearch] =
    useState("");

  const [duplicateProduct, setDuplicateProduct] =
    useState<DuplicateProduct | null>(null);

  const [checkingDuplicate, setCheckingDuplicate] =
    useState(false);

  const [allowDuplicate, setAllowDuplicate] =
    useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Manage Categories modal
  const [manageCategoriesOpen, setManageCategoriesOpen] =
    useState(false);

  const [categoryActionLoading, setCategoryActionLoading] =
    useState<number | null>(null);

  const [categoryToToggle, setCategoryToToggle] =
    useState<Category | null>(null);

  const [categoryActionError, setCategoryActionError] =
    useState("");

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [categorySearch, setCategorySearch] =
    useState("");

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [editCategoryName, setEditCategoryName] =
    useState("");

  const [savingCategoryEdit, setSavingCategoryEdit] =
    useState(false);

  // Manage Sizes modal
  const [manageSizesOpen, setManageSizesOpen] =
    useState(false);

  const [sizes, setSizes] =
    useState<Size[]>([]);

  const [sizeSearch, setSizeSearch] =
    useState("");

  const [newSize, setNewSize] =
    useState("");

  const [addingSize, setAddingSize] =
    useState(false);

  const [editingSize, setEditingSize] =
    useState<Size | null>(null);

  const [editSizeName, setEditSizeName] =
    useState("");

  const [savingSizeEdit, setSavingSizeEdit] =
    useState(false);

  const [sizeActionLoading, setSizeActionLoading] =
    useState<number | null>(null);

  const [sizeToToggle, setSizeToToggle] =
    useState<Size | null>(null);

  const [sizeActionError, setSizeActionError] =
    useState("");

  const [addingSizeToCategory, setAddingSizeToCategory] =
    useState<number | null>(null);

  // Manage Designs modal
  const [manageDesignsOpen, setManageDesignsOpen] =
    useState(false);

  const [designSearch, setDesignSearch] =
    useState("");

  const [newDesignName, setNewDesignName] =
    useState("");

  const [addingDesign, setAddingDesign] =
    useState(false);

  const [editingDesign, setEditingDesign] =
    useState<Design | null>(null);

  const [editDesignName, setEditDesignName] =
    useState("");

  const [savingDesignEdit, setSavingDesignEdit] =
    useState(false);

  const [designActionLoading, setDesignActionLoading] =
    useState<number | null>(null);

  const [designToToggle, setDesignToToggle] =
    useState<Design | null>(null);

  const [designActionError, setDesignActionError] =
    useState("");

  const [addingDesignToCategory, setAddingDesignToCategory] =
    useState<number | null>(null);

  const [addingCategory, setAddingCategory] =
    useState(false);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data, error } =
        await supabase
          .from("categories")
          .select("id, name, active")
          .order("name");

      if (error) {
        console.error(
          "Error loading categories:",
          error
        );

        setError(
          "Unable to load categories."
        );
      } else {
        setCategories(data ?? []);
      }

      setLoadingCategories(false);
    }

    loadCategories();
  }, []);

  // Load colors
  useEffect(() => {
    async function loadColors() {
      const { data, error } =
        await supabase
          .from("colors")
          .select(
            "id, name, hex_code"
          )
          .eq("active", true)
          .order("name");

      if (error) {
        console.error(
          "Error loading colors:",
          error
        );

        setError(
          "Unable to load colors."
        );
      } else {
        setColors(data ?? []);
      }

      setLoadingColors(false);
    }

    loadColors();
  }, []);

  // Clean up image preview URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview
          );
        }
      );
    };
  }, [imagePreviews]);

  // Get configuration for current category
  const categoryConfig =
    CATEGORY_CONFIG[
      getCategoryKey(categoryName)
    ];

  // Load designs allowed for the selected category from:
  // category_designs -> designs
  useEffect(() => {
    async function loadDesignsForCategory() {
      const selectedCategory =
        categories.find(
          (category) =>
            category.active &&
            category.name.trim().toLowerCase() ===
              categoryName.trim().toLowerCase()
        );

      setSelectedDesignId(null);
      setDesignName("");

      if (!selectedCategory) {
        setDesigns([]);
        setLoadingDesigns(false);
        return;
      }

      setLoadingDesigns(true);

      const { data: mappings, error: mappingError } =
        await supabase
          .from("category_designs")
          .select("design_id")
          .eq("category_id", selectedCategory.id);

      if (mappingError) {
        console.error(
          "Error loading category designs:",
          mappingError
        );
        setDesigns([]);
        setLoadingDesigns(false);
        setError("Unable to load designs for this category.");
        return;
      }

      const designIds = (mappings ?? []).map(
        (mapping) => mapping.design_id
      );

      if (designIds.length === 0) {
        setDesigns([]);
        setLoadingDesigns(false);
        return;
      }

      const { data: designRows, error: designError } =
        await supabase
          .from("designs")
          .select("id, name, active")
          .in("id", designIds)
          .order("name");

      if (designError) {
        console.error(
          "Error loading designs:",
          designError
        );
        setDesigns([]);
        setLoadingDesigns(false);
        setError("Unable to load designs.");
        return;
      }

      setDesigns(
        (designRows ?? []).map((design) => ({
          ...design,
          mapped: true,
        }))
      );

      setLoadingDesigns(false);
    }

    loadDesignsForCategory();
  }, [categoryName, categories]);

  // Load sizes from category_sizes -> sizes and keep the existing
  // database-driven color behavior when the category changes.
  useEffect(() => {
    async function loadSizesForCategory() {
      const selectedCategory =
        categories.find(
          (category) =>
            category.active &&
            category.name.trim().toLowerCase() ===
              categoryName.trim().toLowerCase()
        );

      setSelectedSizes([]);

      if (!selectedCategory) {
        setAvailableSizes([]);
        setLoadingSizes(false);
        return;
      }

      setLoadingSizes(true);

      const { data: mappings, error: mappingError } =
        await supabase
          .from("category_sizes")
          .select("size_id")
          .eq("category_id", selectedCategory.id);

      if (mappingError) {
        console.error(
          "Error loading category sizes:",
          mappingError
        );
        setAvailableSizes([]);
        setLoadingSizes(false);
        setError("Unable to load sizes for this category.");
      } else {
        const sizeIds = (mappings ?? []).map(
          (mapping) => mapping.size_id
        );

        if (sizeIds.length === 0) {
          setAvailableSizes([]);
        } else {
          const { data: sizeRows, error: sizeError } =
            await supabase
              .from("sizes")
              .select("id, name")
              .in("id", sizeIds)
              .eq("active", true);

          if (sizeError) {
            console.error(
              "Error loading sizes:",
              sizeError
            );
            setAvailableSizes([]);
            setError("Unable to load sizes.");
          } else {
            const orderedSizes = (sizeRows ?? [])
              .sort((a, b) => Number(a.name) - Number(b.name))
              .map((size) => size.name);

            setAvailableSizes(orderedSizes);
          }
        }
      }

      setLoadingSizes(false);
    }

    loadSizesForCategory();

    const config =
      CATEGORY_CONFIG[
        getCategoryKey(categoryName)
      ];

    if (config) {
      const allowedColorNames = config.colors;

      const defaultColorIds =
        colors
          .filter((color) =>
            allowedColorNames.some(
              (colorName) =>
                colorName.trim().toLowerCase() ===
                color.name.trim().toLowerCase()
            )
          )
          .map((color) => color.id);

      setSelectedColors(defaultColorIds);
    } else {
      setSelectedColors([]);
    }
  }, [categoryName, categories, colors]);

  // Automatically generate product name
  useEffect(() => {
    if (
      !nameManuallyEdited &&
      categoryName.trim() &&
      designName.trim()
    ) {
      const category =
        getCategoryDisplayName(
          categoryName
        );

      const design =
        getDesignDisplayName(
          designName
        );

      setName(
        `${design} ${category}`
      );
    }
  }, [
    categoryName,
    designName,
    nameManuallyEdited,
  ]);

  function handleCategoryChange(
    value: string
  ) {
    setCategoryName(value);
    setCategoryDropdownSearch(value);

    setSelectedDesignId(null);
    setDesignName("");
    setDesignDropdownSearch("");
    setName("");
    setNameManuallyEdited(false);
    setDuplicateProduct(null);
    setAllowDuplicate(false);

    setCategoryOpen(true);
  }

  function handleCategorySelect(
    category: string
  ) {
    setCategoryName(category);
    setCategoryDropdownSearch("");

    setSelectedDesignId(null);
    setDesignName("");
    setDesignDropdownSearch("");
    setName("");
    setNameManuallyEdited(false);
    setDuplicateProduct(null);
    setAllowDuplicate(false);

    setCategoryOpen(false);
  }

  function handleDesignSelect(
    design: Design
  ) {
    setDesignName(design.name);
    setDesignDropdownSearch("");
    setSelectedDesignId(design.id);

    const generatedName =
      `${getDesignDisplayName(
        design.name
      )} ${getCategoryDisplayName(
        categoryName
      )}`;

    setName(generatedName);
    setNameManuallyEdited(false);
    setAllowDuplicate(false);
    setDesignOpen(false);
  }

  async function checkForDuplicateProduct(): Promise<DuplicateProduct | null> {
    const cleanName = name.trim();

    if (!cleanName) {
      setDuplicateProduct(null);
      setCheckingDuplicate(false);
      return null;
    }

    setCheckingDuplicate(true);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category_id, design_id")
      .ilike("name", cleanName)
      .limit(10);

    if (error) {
      console.error("Error checking duplicate product:", error);
      setDuplicateProduct(null);
      setCheckingDuplicate(false);
      return null;
    }

    const matchingProduct =
      (data ?? []).find(
        (product) =>
          product.name.trim().toLowerCase() ===
          cleanName.toLowerCase()
      ) ??
      null;

    setDuplicateProduct(matchingProduct);
    setCheckingDuplicate(false);

    return matchingProduct;
  }

  function handleContinueWithDuplicate() {
    setAllowDuplicate(true);
  }

  // Automatically check the final product name for duplicates.
  // A short delay avoids checking on every keystroke.
  useEffect(() => {
    const cleanName = name.trim();

    if (!cleanName || allowDuplicate) {
      setDuplicateProduct(null);
      setCheckingDuplicate(false);
      return;
    }

    const timer = setTimeout(() => {
      checkForDuplicateProduct();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [name, allowDuplicate]);

  function toggleSize(
    size: string
  ) {
    setSelectedSizes(
      (current) =>
        current.includes(size)
          ? current.filter(
              (item) =>
                item !== size
            )
          : [
              ...current,
              size,
            ]
    );
  }

  function toggleColor(
    colorId: number
  ) {
    setSelectedColors(
      (current) =>
        current.includes(colorId)
          ? current.filter(
              (id) =>
                id !== colorId
            )
          : [
              ...current,
              colorId,
            ]
    );
  }

  function resetForm() {
    imagePreviews.forEach(
      (preview) => {
        URL.revokeObjectURL(
          preview
        );
      }
    );

    setName("");
    setCategoryName("");
    setCategoryDropdownSearch("");
    setSelectedDesignId(null);
    setDesignName("");
    setDesignDropdownSearch("");
    setPrice("");
    setDescription("");

    setFeatured(false);
    setActive(true);

    setAvailableSizes([]);

    setSelectedSizes([]);

    setSelectedColors([]);

    setSelectedImages([]);
    setImagePreviews([]);
    setPrimaryImageIndex(0);

    setCategoryOpen(false);
    setDesignOpen(false);

    setNameManuallyEdited(false);
    setDuplicateProduct(null);
    setAllowDuplicate(false);

    setError("");
  }

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (const file of files) {
      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          `"${file.name}" is larger than 5 MB. Please choose a smaller image.`
        );

        event.target.value = "";
        return;
      }

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setError(
          `"${file.name}" is not supported. Only JPG, PNG and WebP images are allowed.`
        );

        event.target.value = "";
        return;
      }
    }

    imagePreviews.forEach(
      (preview) => {
        URL.revokeObjectURL(
          preview
        );
      }
    );

    setSelectedImages(files);

    const previews =
      files.map((file) =>
        URL.createObjectURL(
          file
        )
      );

    setImagePreviews(
      previews
    );

    setPrimaryImageIndex(0);
  }

  async function loadCategoriesFromDatabase() {
    const { data, error } =
      await supabase
        .from("categories")
        .select("id, name, active")
        .order("name");

    if (error) {
      console.error(
        "Error refreshing categories:",
        error
      );

      setCategoryActionError(
        "Unable to refresh categories."
      );

      return;
    }

    setCategories(data ?? []);
  }

  async function handleToggleCategory(
    category: Category
  ) {
    setCategoryActionLoading(
      category.id
    );

    setCategoryActionError("");

    const newActiveState =
      !category.active;

    const { error } =
      await supabase
        .from("categories")
        .update({
          active:
            newActiveState,
        })
        .eq(
          "id",
          category.id
        );

    if (error) {
      console.error(
        "Error updating category:",
        error
      );

      setCategoryActionError(
        `Unable to ${
          newActiveState
            ? "enable"
            : "disable"
        } ${category.name}.`
      );

      setCategoryActionLoading(
        null
      );

      return;
    }

    setCategories(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            category.id
              ? {
                  ...item,
                  active:
                    newActiveState,
                }
              : item
        )
    );

    // If the currently selected category
    // gets disabled, clear it from the form.
    if (
      !newActiveState &&
      categoryName
        .trim()
        .toLowerCase() ===
        category.name
          .trim()
          .toLowerCase()
    ) {
      setCategoryName("");
      setDesignName("");
      setName("");
      setNameManuallyEdited(false);
      setSelectedSizes([]);
      setSelectedColors([]);
      setAvailableSizes([]);
    }

    setCategoryToToggle(
      null
    );

    setCategoryActionLoading(
      null
    );
  }

  function startEditingCategory(category: Category) {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setCategoryActionError("");
    setCategoryToToggle(null);
  }

  function cancelEditingCategory() {
    setEditingCategory(null);
    setEditCategoryName("");
  }

  async function saveCategoryEdit() {
    if (!editingCategory) {
      return;
    }

    const cleanName = editCategoryName.trim();

    if (!cleanName) {
      setCategoryActionError("Please enter a category name.");
      return;
    }

    const duplicateCategory = categories.find(
      (category) =>
        category.id !== editingCategory.id &&
        category.name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (duplicateCategory) {
      setCategoryActionError("A category with this name already exists.");
      return;
    }

    setSavingCategoryEdit(true);
    setCategoryActionError("");

    const { error } = await supabase
      .from("categories")
      .update({ name: cleanName })
      .eq("id", editingCategory.id);

    if (error) {
      console.error("Error updating category name:", error);
      setCategoryActionError(
        `Unable to rename ${editingCategory.name}. ${error.message}`
      );
      setSavingCategoryEdit(false);
      return;
    }

    const oldCategoryName = editingCategory.name.trim().toLowerCase();

    setCategories((current) =>
      current
        .map((category) =>
          category.id === editingCategory.id
            ? { ...category, name: cleanName }
            : category
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          })
        )
    );

    if (categoryName.trim().toLowerCase() === oldCategoryName) {
      setCategoryName(cleanName);
    }

    setEditingCategory(null);
    setEditCategoryName("");
    setCategoryActionError("");
    setSavingCategoryEdit(false);
  }

  async function handleAddCategory() {
    const cleanName =
      newCategoryName.trim();

    if (!cleanName) {
      setCategoryActionError(
        "Please enter a category name."
      );
      return;
    }

    setAddingCategory(true);
    setCategoryActionError("");

    const existingCategory =
      categories.find(
        (category) =>
          category.name
            .trim()
            .toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (existingCategory) {
      setCategoryActionError(
        existingCategory.active
          ? "This category already exists."
          : "This category already exists but is inactive. Enable it instead."
      );

      setAddingCategory(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
        active: true,
      })
      .select(
        "id, name, active"
      )
      .single();

    if (error) {
      console.error(
        "Error creating category:",
        error
      );

      setCategoryActionError(
        error.message
      );

      setAddingCategory(false);
      return;
    }

    setCategories(
      (current) =>
        [
          ...current,
          data,
        ].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        )
    );

    setNewCategoryName("");

    // Select the newly created category
    setCategoryName(
      data.name
    );
    setDesignName("");
    setName("");
    setNameManuallyEdited(
      false
    );

    setCategoryActionError("");
    setAddingCategory(false);
  }

  async function getOrCreateCategory(
    enteredCategoryName: string
  ): Promise<number | null> {
    const cleanName =
      enteredCategoryName.trim();

    if (!cleanName) {
      return null;
    }

    const existingCategory =
      categories.find(
        (category) =>
          category.active &&
          category.name
            .trim()
            .toLowerCase() ===
            cleanName.toLowerCase()
      );

    if (existingCategory) {
      return existingCategory.id;
    }

    const {
      data: databaseCategory,
      error: findError,
    } = await supabase
      .from("categories")
      .select(
        "id, name, active"
      )
      .ilike(
        "name",
        cleanName
      )
      .maybeSingle();

    if (findError) {
      console.error(
        "Error checking category:",
        findError
      );

      setError(
        findError.message
      );

      return null;
    }

    if (databaseCategory) {
      if (!databaseCategory.active) {
        setError(
          `Category "${databaseCategory.name}" is inactive. Please enable it from Manage Categories.`
        );

        return null;
      }

      setCategories(
        (current) => {
          const alreadyExists =
            current.some(
              (category) =>
                category.id ===
                databaseCategory.id
            );

          if (alreadyExists) {
            return current;
          }

          return [
            ...current,
            databaseCategory,
          ].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          );
        }
      );

      return databaseCategory.id;
    }

    const {
      data: newCategory,
      error: createError,
    } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
        active: true,
      })
      .select(
        "id, name, active"
      )
      .single();

    if (createError) {
      console.error(
        "Error creating category:",
        createError
      );

      setError(
        createError.message
      );

      return null;
    }

    setCategories(
      (current) =>
        [
          ...current,
          newCategory,
        ].sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        )
    );

    return newCategory.id;
  }

  async function loadDesignsForManagement() {
    const { data: allDesigns, error: designError } =
      await supabase
        .from("designs")
        .select("id, name, active")
        .order("name");

    if (designError) {
      console.error(
        "Error loading designs for management:",
        designError
      );
      setDesignActionError("Unable to load designs.");
      return;
    }

    const selectedCategory =
      categories.find(
        (category) =>
          category.active &&
          category.name.trim().toLowerCase() ===
            categoryName.trim().toLowerCase()
      );

    let mappedIds = new Set<number>();

    if (selectedCategory) {
      const { data: mappings, error: mappingError } =
        await supabase
          .from("category_designs")
          .select("design_id")
          .eq("category_id", selectedCategory.id);

      if (mappingError) {
        console.error(
          "Error loading design mappings:",
          mappingError
        );
        setDesignActionError(
          "Unable to load category design mappings."
        );
        return;
      }

      mappedIds = new Set(
        (mappings ?? []).map(
          (mapping) => mapping.design_id
        )
      );
    }

    setDesigns(
      (allDesigns ?? []).map((design) => ({
        ...design,
        mapped: mappedIds.has(design.id),
      }))
    );
  }

  function openManageDesigns() {
    const selectedCategory =
      categories.find(
        (category) =>
          category.active &&
          category.name.trim().toLowerCase() ===
            categoryName.trim().toLowerCase()
      );

    setDesignSearch("");
    setNewDesignName("");
    setEditingDesign(null);
    setDesignToToggle(null);
    setDesignActionError("");
    setManageDesignsOpen(true);

    if (selectedCategory) {
      loadDesignsForManagement();
    } else {
      setDesigns([]);
      setDesignActionError(
        "Please select an existing category first."
      );
    }
  }

  function startEditingDesign(design: Design) {
    setEditingDesign(design);
    setEditDesignName(design.name);
    setDesignActionError("");
    setDesignToToggle(null);
  }

  function cancelEditingDesign() {
    setEditingDesign(null);
    setEditDesignName("");
  }

  async function saveDesignEdit() {
    if (!editingDesign) {
      return;
    }

    const cleanName = editDesignName.trim();

    if (!cleanName) {
      setDesignActionError("Please enter a design name.");
      return;
    }

    const duplicateDesign = designs.find(
      (design) =>
        design.id !== editingDesign.id &&
        design.name.trim().toLowerCase() ===
          cleanName.toLowerCase()
    );

    if (duplicateDesign) {
      setDesignActionError(
        "A design with this name already exists."
      );
      return;
    }

    setSavingDesignEdit(true);
    setDesignActionError("");

    const { error } = await supabase
      .from("designs")
      .update({ name: cleanName })
      .eq("id", editingDesign.id);

    if (error) {
      console.error(
        "Error updating design name:",
        error
      );
      setDesignActionError(
        `Unable to rename ${editingDesign.name}. ${error.message}`
      );
      setSavingDesignEdit(false);
      return;
    }

    setDesigns((current) =>
      current
        .map((design) =>
          design.id === editingDesign.id
            ? { ...design, name: cleanName }
            : design
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          })
        )
    );

    if (selectedDesignId === editingDesign.id) {
      setDesignName(cleanName);
    }

    setEditingDesign(null);
    setEditDesignName("");
    setDesignActionError("");
    setSavingDesignEdit(false);
  }

  async function handleToggleDesign(design: Design) {
    setDesignActionLoading(design.id);
    setDesignActionError("");

    const newActiveState = !design.active;

    const { error } = await supabase
      .from("designs")
      .update({ active: newActiveState })
      .eq("id", design.id);

    if (error) {
      console.error(
        "Error updating design status:",
        error
      );
      setDesignActionError(
        `Unable to ${
          newActiveState ? "enable" : "disable"
        } ${design.name}.`
      );
      setDesignActionLoading(null);
      return;
    }

    setDesigns((current) =>
      current.map((item) =>
        item.id === design.id
          ? { ...item, active: newActiveState }
          : item
      )
    );

    if (!newActiveState && selectedDesignId === design.id) {
      setSelectedDesignId(null);
      setDesignName("");
      setName("");
      setNameManuallyEdited(false);
    }

    setDesignToToggle(null);
    setDesignActionLoading(null);

    // Refresh the actual category design dropdown.
    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    if (selectedCategory) {
      const { data: mappings } = await supabase
        .from("category_designs")
        .select("design_id")
        .eq("category_id", selectedCategory.id);

      const mappedIds = new Set(
        (mappings ?? []).map(
          (mapping) => mapping.design_id
        )
      );

      const { data: refreshedDesigns } = await supabase
        .from("designs")
        .select("id, name, active")
        .in("id", Array.from(mappedIds))
        .order("name");

      setDesigns(
        (refreshedDesigns ?? []).map((item) => ({
          ...item,
          mapped: true,
        }))
      );
    }
  }

  async function handleAddDesign() {
    const cleanName = newDesignName.trim();

    if (!cleanName) {
      setDesignActionError("Please enter a design name.");
      return;
    }

    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    if (!selectedCategory) {
      setDesignActionError(
        "Please select an existing category first."
      );
      return;
    }

    setAddingDesign(true);
    setDesignActionError("");

    let designId: number;

    const existingDesign = designs.find(
      (design) =>
        design.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    if (existingDesign) {
      if (!existingDesign.active) {
        setDesignActionError(
          "This design already exists but is inactive. Enable it first."
        );
        setAddingDesign(false);
        return;
      }

      designId = existingDesign.id;
    } else {
      const { data, error } = await supabase
        .from("designs")
        .insert({
          name: cleanName,
          active: true,
        })
        .select("id, name, active")
        .single();

      if (error) {
        console.error(
          "Error creating design:",
          error
        );
        setDesignActionError(error.message);
        setAddingDesign(false);
        return;
      }

      designId = data.id;
    }

    const { error: mappingError } = await supabase
      .from("category_designs")
      .insert({
        category_id: selectedCategory.id,
        design_id: designId,
      });

    if (mappingError) {
      if (mappingError.code === "23505") {
        setDesignActionError(
          "This design is already available for the selected category."
        );
      } else {
        console.error(
          "Error mapping design to category:",
          mappingError
        );
        setDesignActionError(
          `The design was created, but it could not be added to ${selectedCategory.name}.`
        );
      }

      setAddingDesign(false);
      return;
    }

    setNewDesignName("");
    setDesignActionError("");

    await loadDesignsForManagement();

    const newlyAddedDesign = designs.find(
      (design) => design.id === designId
    );

    if (newlyAddedDesign) {
      setDesignName(newlyAddedDesign.name);
      setSelectedDesignId(newlyAddedDesign.id);
    } else {
      const { data: createdDesign } = await supabase
        .from("designs")
        .select("id, name, active")
        .eq("id", designId)
        .single();

      if (createdDesign) {
        setDesignName(createdDesign.name);
        setSelectedDesignId(createdDesign.id);
      }
    }

    setAddingDesign(false);
  }

  async function handleAddDesignToCategory(design: Design) {
    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    if (!selectedCategory) {
      setDesignActionError(
        "Please select an existing category first."
      );
      return;
    }

    setAddingDesignToCategory(design.id);
    setDesignActionError("");

    const { error } = await supabase
      .from("category_designs")
      .insert({
        category_id: selectedCategory.id,
        design_id: design.id,
      });

    if (error && error.code !== "23505") {
      console.error(
        "Error adding design to category:",
        error
      );
      setDesignActionError(
        `Unable to add ${design.name} to ${selectedCategory.name}.`
      );
    }

    setAddingDesignToCategory(null);
    await loadDesignsForManagement();
  }

  async function loadSizesForManagement() {
    const { data: allSizes, error: sizeError } =
      await supabase
        .from("sizes")
        .select("id, name, active")
        .order("name");

    if (sizeError) {
      console.error(
        "Error loading sizes for management:",
        sizeError
      );
      setSizeActionError("Unable to load sizes.");
      return;
    }

    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    let mappedIds = new Set<number>();

    if (selectedCategory) {
      const { data: mappings, error: mappingError } =
        await supabase
          .from("category_sizes")
          .select("size_id")
          .eq("category_id", selectedCategory.id);

      if (mappingError) {
        console.error(
          "Error loading size mappings:",
          mappingError
        );
        setSizeActionError(
          "Unable to load category size mappings."
        );
        return;
      }

      mappedIds = new Set(
        (mappings ?? []).map(
          (mapping) => mapping.size_id
        )
      );
    }

    setSizes(
      (allSizes ?? []).map((size) => ({
        ...size,
        mapped: mappedIds.has(size.id),
      }))
    );
  }

  function openManageSizes() {
    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    setSizeSearch("");
    setNewSize("");
    setEditingSize(null);
    setEditSizeName("");
    setSizeToToggle(null);
    setSizeActionError("");
    setManageSizesOpen(true);

    if (selectedCategory) {
      loadSizesForManagement();
    } else {
      setSizes([]);
      setSizeActionError(
        "Please select an existing category first."
      );
    }
  }

  function startEditingSize(size: Size) {
    setEditingSize(size);
    setEditSizeName(size.name);
    setSizeActionError("");
    setSizeToToggle(null);
  }

  function cancelEditingSize() {
    setEditingSize(null);
    setEditSizeName("");
  }

  async function saveSizeEdit() {
    if (!editingSize) {
      return;
    }

    const cleanName = editSizeName.trim();

    if (!cleanName) {
      setSizeActionError("Please enter a size.");
      return;
    }

    if (!/^\d+$/.test(cleanName)) {
      setSizeActionError("Please enter a numeric size only.");
      return;
    }

    const duplicateSize = sizes.find(
      (size) =>
        size.id !== editingSize.id &&
        size.name.trim().toLowerCase() ===
          cleanName.toLowerCase()
    );

    if (duplicateSize) {
      setSizeActionError("A size with this value already exists.");
      return;
    }

    setSavingSizeEdit(true);
    setSizeActionError("");

    const { error } = await supabase
      .from("sizes")
      .update({ name: cleanName })
      .eq("id", editingSize.id);

    if (error) {
      console.error(
        "Error updating size name:",
        error
      );
      setSizeActionError(
        `Unable to rename size ${editingSize.name}. ${error.message}`
      );
      setSavingSizeEdit(false);
      return;
    }

    setSizes((current) =>
      current
        .map((size) =>
          size.id === editingSize.id
            ? { ...size, name: cleanName }
            : size
        )
        .sort((a, b) => Number(a.name) - Number(b.name))
    );

    setAvailableSizes((current) =>
      current
        .map((size) =>
          size === editingSize.name
            ? cleanName
            : size
        )
        .sort((a, b) => Number(a) - Number(b))
    );

    setSelectedSizes((current) =>
      current.map((size) =>
        size === editingSize.name
          ? cleanName
          : size
      )
    );

    setEditingSize(null);
    setEditSizeName("");
    setSizeActionError("");
    setSavingSizeEdit(false);
  }

  async function handleToggleSize(size: Size) {
    setSizeActionLoading(size.id);
    setSizeActionError("");

    const newActiveState = !size.active;

    const { error } = await supabase
      .from("sizes")
      .update({ active: newActiveState })
      .eq("id", size.id);

    if (error) {
      console.error(
        "Error updating size status:",
        error
      );
      setSizeActionError(
        `Unable to ${
          newActiveState ? "enable" : "disable"
        } size ${size.name}. ${error.message}`
      );
      setSizeActionLoading(null);
      return;
    }

    setSizes((current) =>
      current.map((item) =>
        item.id === size.id
          ? { ...item, active: newActiveState }
          : item
      )
    );

    if (!newActiveState) {
      setAvailableSizes((current) =>
        current.filter((item) => item !== size.name)
      );
      setSelectedSizes((current) =>
        current.filter((item) => item !== size.name)
      );
    }

    setSizeToToggle(null);
    setSizeActionLoading(null);
  }

  async function handleAddSize() {
    const cleanName = newSize.trim();

    if (!cleanName) {
      setSizeActionError("Please enter a size.");
      return;
    }

    if (!/^\d+$/.test(cleanName)) {
      setSizeActionError("Please enter a numeric size only.");
      return;
    }

    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    if (!selectedCategory) {
      setSizeActionError(
        "Please select an existing category first."
      );
      return;
    }

    setAddingSize(true);
    setSizeActionError("");

    const existingSize = sizes.find(
      (size) =>
        size.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    let sizeId: number;

    if (existingSize) {
      if (!existingSize.active) {
        setSizeActionError(
          "This size already exists but is inactive. Enable it first."
        );
        setAddingSize(false);
        return;
      }

      if (existingSize.mapped) {
        setSizeActionError(
          "This size is already available for the selected category."
        );
        setAddingSize(false);
        return;
      }

      sizeId = existingSize.id;
    } else {
      const { data, error } = await supabase
        .from("sizes")
        .insert({
          name: cleanName,
          active: true,
        })
        .select("id, name, active")
        .single();

      if (error) {
        console.error(
          "Error creating size:",
          error
        );
        setSizeActionError(error.message);
        setAddingSize(false);
        return;
      }

      sizeId = data.id;
    }

    const { error: mappingError } = await supabase
      .from("category_sizes")
      .insert({
        category_id: selectedCategory.id,
        size_id: sizeId,
      });

    if (mappingError) {
      if (mappingError.code === "23505") {
        setSizeActionError(
          "This size is already available for the selected category."
        );
      } else {
        console.error(
          "Error mapping size to category:",
          mappingError
        );
        setSizeActionError(
          `The size was created, but it could not be added to ${selectedCategory.name}. ${mappingError.message}`
        );
      }

      setAddingSize(false);
      await loadSizesForManagement();
      return;
    }

    setNewSize("");
    setSizeActionError("");

    setAvailableSizes((current) =>
      Array.from(new Set([...current, cleanName])).sort(
        (a, b) => Number(a) - Number(b)
      )
    );

    setSelectedSizes((current) =>
      current.includes(cleanName)
        ? current
        : [...current, cleanName]
    );

    await loadSizesForManagement();
    setAddingSize(false);
  }

  async function handleAddSizeToCategory(size: Size) {
    const selectedCategory = categories.find(
      (category) =>
        category.active &&
        category.name.trim().toLowerCase() ===
          categoryName.trim().toLowerCase()
    );

    if (!selectedCategory) {
      setSizeActionError(
        "Please select an existing category first."
      );
      return;
    }

    setAddingSizeToCategory(size.id);
    setSizeActionError("");

    const { error } = await supabase
      .from("category_sizes")
      .insert({
        category_id: selectedCategory.id,
        size_id: size.id,
      });

    if (error && error.code !== "23505") {
      console.error(
        "Error adding size to category:",
        error
      );
      setSizeActionError(
        `Unable to add size ${size.name} to ${selectedCategory.name}. ${error.message}`
      );
    } else {
      setAvailableSizes((current) =>
        Array.from(new Set([...current, size.name])).sort(
          (a, b) => Number(a) - Number(b)
        )
      );
    }

    setAddingSizeToCategory(null);
    await loadSizesForManagement();
  }

  // Only sizes mapped to the currently selected category and still active
  // are presented in the Add Product form.
  const managedSizes =
    sizes
      .filter((size) =>
        size.name
          .toLowerCase()
          .includes(sizeSearch.trim().toLowerCase())
      )
      .sort((a, b) => Number(a.name) - Number(b.name));

  async function saveProductDesign(
    productId: number
  ) {
    if (!designName.trim()) {
      return;
    }

    const { error } =
      await supabase
        .from("product_designs")
        .insert({
          product_id:
            productId,
          name:
            designName.trim(),
          description:
            null,
        });

    if (error) {
      throw error;
    }
  }

  async function saveProductColors(
    productId: number
  ) {
    if (
      selectedColors.length ===
      0
    ) {
      return;
    }

    const colorRows =
      selectedColors.map(
        (colorId) => ({
          product_id:
            productId,
          color_id:
            colorId,
        })
      );

    const { error } =
      await supabase
        .from("product_colors")
        .insert(
          colorRows
        );

    if (error) {
      throw error;
    }
  }

  async function uploadProductImages(
    productId: number,
    productName: string,
    files: File[],
    primaryIndex: number
  ) {
    if (files.length === 0) {
      return;
    }

    for (
      let index = 0;
      index < files.length;
      index++
    ) {
      const file =
        files[index];

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const safeName =
        file.name
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          ) ||
        "product-image";

      const uniqueName =
        `${crypto.randomUUID()}-${safeName}.${extension}`;

      const storagePath =
        `products/${productId}/${uniqueName}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "product-images"
          )
          .upload(
            storagePath,
            file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from(
            "product-images"
          )
          .getPublicUrl(
            storagePath
          );

      const imageUrl =
        publicUrlData.publicUrl;

      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            "product_images"
          )
          .insert({
            product_id:
              productId,
            image_url:
              imageUrl,
            alt_text:
              productName,
            sort_order:
              index,
            is_primary:
              index ===
              primaryIndex,
          });

      if (insertError) {
        throw insertError;
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setCategoryOpen(false);
    setDesignOpen(false);

    if (!categoryName.trim()) {
      setError(
        "Please select or enter a category."
      );
      return;
    }

    if (!designName.trim()) {
      setError(
        "Please select or enter a design."
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Please enter a product name."
      );
      return;
    }

    if (
      !price ||
      Number(price) < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (
      selectedSizes.length ===
      0
    ) {
      setError(
        "Please select at least one size."
      );
      return;
    }

    if (
      selectedColors.length ===
      0
    ) {
      setError(
        "Please select at least one color."
      );
      return;
    }

    if (
      selectedImages.length ===
      0
    ) {
      setError(
        "Please upload at least one product image."
      );
      return;
    }

    if (!selectedDesignId) {
      setError(
        "Please select a valid design from the available options."
      );
      return;
    }

    if (!allowDuplicate) {
      const existingProduct =
        await checkForDuplicateProduct();

      if (existingProduct) {
        return;
      }
    }

    setSaving(true);

    const finalCategoryId =
      await getOrCreateCategory(
        categoryName
      );

    if (!finalCategoryId) {
      setSaving(false);
      return;
    }

    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        "");

    let slug = baseSlug;

    if (allowDuplicate) {
      const uniqueSuffix = Math.random()
        .toString(36)
        .slice(2, 7);

      slug = `${baseSlug}-${uniqueSuffix}`;
    }

    // Create product
    const {
      data,
      error,
    } =
      await supabase
        .from("products")
        .insert({
          name:
            name.trim(),
          category_id:
            finalCategoryId,
          design_id:
            selectedDesignId,
          price:
            Number(price),
          description:
            description.trim() ||
            null,
          slug,
          featured,
          active,
        })
        .select("id")
        .single();

    if (error) {
      console.error(
        "Error creating product:",
        error
      );

      setError(
        error.message
      );

      setSaving(false);
      return;
    }

    // Save sizes
    const sizeRows =
      selectedSizes.map(
        (size) => ({
          product_id:
            data.id,
          size,
        })
      );

    const {
      error: sizeError,
    } =
      await supabase
        .from(
          "product_sizes"
        )
        .insert(
          sizeRows
        );

    if (sizeError) {
      console.error(
        "Error saving sizes:",
        sizeError
      );

      setError(
        `Product was created, but the sizes could not be saved: ${sizeError.message}`
      );

      setSaving(false);
      return;
    }

    // Save legacy product design
    // for the old table until migration
    // is completed.
    try {
      await saveProductDesign(
        data.id
      );
    } catch (designError) {
      console.error(
        "Error saving design:",
        designError
      );

      setError(
        designError instanceof
        Error
          ? `Product was created, but the design could not be saved: ${designError.message}`
          : "Product was created, but the design could not be saved."
      );

      setSaving(false);
      return;
    }

    // Save colors
    try {
      await saveProductColors(
        data.id
      );
    } catch (colorError) {
      console.error(
        "Error saving colors:",
        colorError
      );

      setError(
        colorError instanceof
        Error
          ? `Product was created, but the colors could not be saved: ${colorError.message}`
          : "Product was created, but the colors could not be saved."
      );

      setSaving(false);
      return;
    }

    // Upload images
    try {
      await uploadProductImages(
        data.id,
        name.trim(),
        selectedImages,
        primaryImageIndex
      );
    } catch (uploadError) {
      console.error(
        "Image upload error:",
        uploadError
      );

      setError(
        uploadError instanceof
        Error
          ? `Product was created, but the image upload failed: ${uploadError.message}`
          : "Product was created, but the image upload failed."
      );

      setSaving(false);
      return;
    }

    // Success
    router.push(
      "/admin/products"
    );

    router.refresh();
  }

  // Only active categories appear
  // in the product category dropdown.
  const activeCategories =
    categories.filter(
      (category) =>
        category.active
    );

  const managedCategories =
    categories
      .filter((category) =>
        category.name
          .toLowerCase()
          .includes(
            categorySearch
              .trim()
              .toLowerCase()
          )
      )
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          undefined,
          {
            sensitivity: "base",
          }
        )
      );

  const filteredCategories =
    activeCategories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(
            categoryDropdownSearch
              .trim()
              .toLowerCase()
          )
    );

  const filteredDesigns =
    designs
      .filter((design) => design.active && design.mapped)
      .filter((design) =>
        design.name
          .toLowerCase()
          .includes(
            designDropdownSearch
              .trim()
              .toLowerCase()
          )
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        })
      );

  const managedDesigns =
    designs
      .filter((design) =>
        design.name
          .toLowerCase()
          .includes(
            designSearch
              .trim()
              .toLowerCase()
          )
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        })
      );

  const categoryColorNames =
    categoryConfig?.colors ?? [];

  const displayedColors =
    categoryConfig
      ? colors.filter((color) =>
          categoryColorNames.some(
            (colorName) =>
              colorName
                .trim()
                .toLowerCase() ===
              color.name
                .trim()
                .toLowerCase()
          )
        )
      : colors;

  const duplicateBlocksForm =
    Boolean(duplicateProduct) &&
    !allowDuplicate;

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">

      {/* Header */}

      <header className="border-b border-[#e7e5e0] bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          <div>
            <a
              href="/admin"
              className="text-xl font-semibold tracking-[0.22em]"
            >
              BHOLA CREATIONS
            </a>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#b8925a]">
              Admin Portal
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/admin/products"
              className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
            >
              Products
            </a>

            <a
              href="/admin"
              className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
            >
              Dashboard
            </a>
          </div>

        </div>
      </header>

      {/* Page */}

      <section className="mx-auto max-w-4xl px-6 py-12 lg:px-8">

        {/* Heading */}

        <div>
          <a
            href="/admin/products"
            className="text-sm text-[#666666] transition-colors hover:text-[#b8925a]"
          >
            ← Back to Products
          </a>

          <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#b8925a]">
            Catalogue
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Add Product
          </h1>

          <p className="mt-3 text-sm text-[#666666]">
            Add a new product to the
            Bhola Creations catalogue.
          </p>
        </div>

        {/* Form */}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-10 border border-[#e7e5e0] bg-white p-6 sm:p-8"
        >

          {/* Form Header */}

          <div className="flex items-center justify-between border-b border-[#e7e5e0] pb-5">

            <div>
              <h2 className="text-base font-medium">
                Product Details
              </h2>

              <p className="mt-1 text-xs text-[#888888]">
                Enter the information for your
                new product.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="border border-[#d8d4cc] px-4 py-2 text-xs font-medium text-[#666666] transition-colors hover:border-[#171717] hover:text-[#171717]"
            >
              Reset
            </button>

          </div>

          {/* Category */}

          <div className="mt-6">

            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="category"
                className="text-sm font-medium"
              >
                Category
              </label>

              <button
                type="button"
                onClick={() => {
                  setManageCategoriesOpen(
                    true
                  );
                  setCategoryActionError(
                    ""
                  );
                  setCategoryToToggle(
                    null
                  );
                  setCategorySearch("");
                }}
                className="text-xs font-medium text-[#b8925a] transition-colors hover:text-[#171717]"
              >
                Manage Categories
              </button>
            </div>

            <div className="relative">

              <input
                id="category"
                type="text"
                value={categoryName}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value
                  )
                }
                onFocus={() => {
                  // Keep the selected value visible in the input,
                  // but show the full list when the field is reopened.
                  setCategoryDropdownSearch("");
                  setCategoryOpen(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setCategoryOpen(
                      false
                    );
                  }, 150);
                }}
                placeholder={
                  loadingCategories
                    ? "Loading categories..."
                    : "Select or type a category"
                }
                disabled={
                  loadingCategories
                }
                autoComplete="off"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
                required
              />

              {categoryOpen &&
                !loadingCategories && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto border border-[#e7e5e0] bg-white shadow-lg">

                    {filteredCategories.length >
                    0 ? (

                      filteredCategories.map(
                        (category) => (

                          <button
                            key={
                              category.id
                            }
                            type="button"
                            onMouseDown={(
                              event
                            ) =>
                              event.preventDefault()
                            }
                            onClick={() =>
                              handleCategorySelect(
                                category.name
                              )
                            }
                            className="block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[#f8f7f4]"
                          >
                            {
                              category.name
                            }
                          </button>

                        )
                      )

                    ) : categoryName.trim() ? (

                      <div className="px-4 py-3 text-sm text-[#888888]">
                        New category —
                        "{categoryName.trim()}"
                        will be created.
                      </div>

                    ) : (

                      <div className="px-4 py-3 text-sm text-[#888888]">
                        No active categories
                        available.
                      </div>

                    )}

                  </div>
                )}

            </div>

            <p className="mt-2 text-xs text-[#888888]">
              Select an active category or type a new one.
            </p>

          </div>

          {/* Design */}

          <div className="mt-6">

            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="design"
                className="text-sm font-medium"
              >
                Design
              </label>

              <button
                type="button"
                onClick={openManageDesigns}
                disabled={!categoryName.trim()}
                className="text-xs font-medium text-[#b8925a] transition-colors hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Manage Designs
              </button>
            </div>

            <div className="relative">

              <input
                id="design"
                type="text"
                value={designName}
                onChange={(event) => {
                  setDesignName(event.target.value);
                  setDesignDropdownSearch(event.target.value);
                  setSelectedDesignId(null);
                  setDesignOpen(true);
                }}
                onFocus={() => {
                  // Keep the selected value visible in the input,
                  // but show all designs mapped to the category.
                  setDesignDropdownSearch("");
                  setDesignOpen(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setDesignOpen(false);
                  }, 150);
                }}
                placeholder={
                  categoryName.trim()
                    ? loadingDesigns
                      ? "Loading designs..."
                      : "Select a design"
                    : "Select a category first"
                }
                disabled={
                  !categoryName.trim() || loadingDesigns
                }
                autoComplete="off"
                className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a] disabled:cursor-not-allowed disabled:opacity-50"
                required
              />

              {designOpen &&
                categoryName.trim() &&
                !loadingDesigns && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto border border-[#e7e5e0] bg-white shadow-lg">

                    {filteredDesigns.length > 0 ? (
                      filteredDesigns.map((design) => (
                        <button
                          key={design.id}
                          type="button"
                          onMouseDown={(event) =>
                            event.preventDefault()
                          }
                          onClick={() =>
                            handleDesignSelect(design)
                          }
                          className="block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[#f8f7f4]"
                        >
                          {design.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-[#888888]">
                        No designs are available for this category. Use
                        Manage Designs to add one.
                      </div>
                    )}

                  </div>
                )}

            </div>

            <p className="mt-2 text-xs text-[#888888]">
              Select a design already assigned to this category.
            </p>

          </div>

          {/* Product Name */}

          <div className="mt-6">

            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Product Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(
                  event.target.value
                );

                setNameManuallyEdited(
                  true
                );
                setDuplicateProduct(null);
                setAllowDuplicate(false);
              }}
              onBlur={() => {
                checkForDuplicateProduct();
              }}
              placeholder="Product name will be generated automatically"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
              required
            />

            <p className="mt-2 text-xs text-[#888888]">
              Generated from Design + Category.
              You can edit it if needed.
            </p>

            {duplicateBlocksForm && (
              <p className="mt-2 text-[11px] text-[#8a5a00]">
                Continue anyway to enable the remaining product fields.
              </p>
            )}

            {checkingDuplicate && name.trim() && (
              <div className="mt-3 text-xs text-[#888888]">
                Checking catalogue...
              </div>
            )}

            {duplicateProduct && !checkingDuplicate && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                <div className="min-w-0">
                  <span className="font-medium">
                    This product name already exists.
                  </span>{" "}
                  <span className="text-amber-800">
                    {duplicateProduct.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleContinueWithDuplicate}
                  className="shrink-0 rounded-md bg-[#171717] px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#303030]"
                >
                  Continue Anyway
                </button>
              </div>
            )}

          </div>

          {/* Fields below the duplicate warning remain disabled
              until the admin explicitly continues. */}
          <fieldset
            disabled={duplicateBlocksForm}
            className={
              duplicateBlocksForm
                ? "pointer-events-none select-none opacity-60"
                : ""
            }
          >

          {/* Price */}

          <div className="mt-6">

            <label
              htmlFor="price"
              className="text-sm font-medium"
            >
              Price (₹)
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              placeholder="3500"
              className="mt-2 w-full border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
              required
            />

          </div>

          {/* Available Sizes */}

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <label className="text-sm font-medium">
                Available Sizes
              </label>

              <button
                type="button"
                onClick={() => {
                  openManageSizes();
                  setError("");
                }}
                disabled={!categoryName.trim()}
                className="text-xs font-medium text-[#b8925a] transition-colors hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Manage Sizes
              </button>

            </div>

            {loadingSizes ? (
              <div className="mt-3 py-3 text-sm text-[#888888]">
                Loading sizes...
              </div>
            ) : availableSizes.length === 0 ? (
              <div className="mt-3 py-3 text-sm text-[#888888]">
                No sizes are mapped to this category yet.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">

              {availableSizes.map(
                (size) => {

                  const selected =
                    selectedSizes.includes(
                      size
                    );

                  return (

                    <label
                      key={
                        size
                      }
                      className={`flex cursor-pointer items-center justify-center border px-4 py-3 text-sm transition-colors ${
                        selected
                          ? "border-[#b8925a] bg-[#b8925a] text-white"
                          : "border-[#e7e5e0] bg-[#f8f7f4] text-[#171717] hover:border-[#b8925a]"
                      }`}
                    >

                      <input
                        type="checkbox"
                        value={size}
                        checked={
                          selected
                        }
                        onChange={() =>
                          toggleSize(
                            size
                          )
                        }
                        className="sr-only"
                      />

                      {size}

                    </label>

                  );
                }
              )}

              </div>
            )}

            <p className="mt-2 text-xs text-[#888888]">
              Select all sizes available
              for this product.
            </p>

          </div>

          {/* Colors */}

          <div className="mt-6">

            <div className="flex items-center justify-between">

              <label className="text-sm font-medium">
                Available Colors
              </label>

              {selectedColors.length >
                0 && (
                <span className="text-xs text-[#888888]">
                  {selectedColors.length}
                  {" "}
                  selected
                </span>
              )}

            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

              {loadingColors ? (

                <div className="col-span-full py-3 text-sm text-[#888888]">
                  Loading colors...
                </div>

              ) : displayedColors.length >
                0 ? (

                displayedColors.map(
                  (color) => {

                    const selected =
                      selectedColors.includes(
                        color.id
                      );

                    return (

                      <label
                        key={
                          color.id
                        }
                        className={`flex cursor-pointer items-center gap-3 border px-3 py-3 text-sm transition-colors ${
                          selected
                            ? "border-[#b8925a] bg-[#f8f7f4]"
                            : "border-[#e7e5e0] bg-white hover:border-[#b8925a]"
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleColor(
                              color.id
                            )
                          }
                          className="sr-only"
                        />

                        <span
                          className="h-5 w-5 flex-shrink-0 rounded-full border border-[#d8d4cc]"
                          style={{
                            backgroundColor:
                              color.hex_code ||
                              "#ffffff",
                          }}
                        />

                        <span>
                          {
                            color.name
                          }
                        </span>

                      </label>

                    );
                  }
                )

              ) : (

                <div className="col-span-full py-3 text-sm text-[#888888]">
                  No colors available for
                  this category.
                </div>

              )}

            </div>

            <p className="mt-2 text-xs text-[#888888]">
              Colors are automatically filtered
              according to the selected category.
            </p>

          </div>

          {/* Product Images */}

          <div className="mt-6">

            <label
              htmlFor="product-images"
              className="text-sm font-medium"
            >
              Product Images
            </label>

            <div className="mt-3 border border-dashed border-[#d8d4cc] bg-[#f8f7f4] p-6">

              <label
                htmlFor="product-images"
                className="flex cursor-pointer flex-col items-center justify-center text-center"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#888888]"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line
                    x1="12"
                    y1="3"
                    x2="12"
                    y2="15"
                  />
                </svg>

                <span className="mt-3 text-sm font-medium">
                  Click to upload product
                  images
                </span>

                <span className="mt-1 text-xs text-[#888888]">
                  JPG, PNG or WebP ·
                  Maximum 5 MB each
                </span>

              </label>

              <input
                id="product-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={
                  handleImageSelect
                }
                className="hidden"
              />

            </div>

            {imagePreviews.length >
              0 && (

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                {imagePreviews.map(
                  (
                    preview,
                    index
                  ) => {

                    const isPrimary =
                      index ===
                      primaryImageIndex;

                    return (

                      <div
                        key={
                          preview
                        }
                        className={`relative overflow-hidden border bg-[#f8f7f4] ${
                          isPrimary
                            ? "border-2 border-[#b8925a]"
                            : "border-[#e7e5e0]"
                        }`}
                      >

                        <div className="aspect-square">

                          <img
                            src={
                              preview
                            }
                            alt={`Product preview ${
                              index +
                              1
                            }`}
                            className="h-full w-full object-cover"
                          />

                        </div>

                        {isPrimary && (
                          <span className="absolute left-2 top-2 bg-[#b8925a] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                            Primary
                          </span>
                        )}

                        <div className="p-2">

                          <button
                            type="button"
                            onClick={() =>
                              setPrimaryImageIndex(
                                index
                              )
                            }
                            disabled={
                              isPrimary
                            }
                            className={`w-full px-3 py-2 text-xs font-medium transition ${
                              isPrimary
                                ? "cursor-default bg-[#171717] text-white"
                                : "border border-[#171717] bg-white text-[#171717] hover:bg-[#171717] hover:text-white"
                            }`}
                          >
                            {isPrimary
                              ? "Primary Image"
                              : "Make Primary"}
                          </button>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

            <p className="mt-2 text-xs text-[#888888]">
              Click "Make Primary" on the
              image you want customers to
              see as the main product image.
            </p>

          </div>

          {/* Description */}

          <div className="mt-6">

            <label
              htmlFor="description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the product..."
              rows={5}
              className="mt-2 w-full resize-none border border-[#e7e5e0] bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
            />

            <p className="mt-2 text-xs text-[#888888]">
              You can include the set type here,
              for example: "3 Piece".
            </p>

          </div>

          {/* Product Settings */}

          <div className="mt-8 border-t border-[#e7e5e0] pt-6">

            <h2 className="text-sm font-medium">
              Product Settings
            </h2>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">

              <label className="flex items-center gap-3 text-sm">

                <input
                  type="checkbox"
                  checked={
                    featured
                  }
                  onChange={(event) =>
                    setFeatured(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <span>
                  Featured product
                </span>

              </label>

              <label className="flex items-center gap-3 text-sm">

                <input
                  type="checkbox"
                  checked={
                    active
                  }
                  onChange={(event) =>
                    setActive(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <span>
                  Active — show this product
                  in the store
                </span>

              </label>

            </div>

          </div>

          </fieldset>

          {/* Error */}

          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Bottom Buttons */}

          <div className="mt-8 flex items-center gap-4">

            <a
              href="/admin/products"
              className="border border-[#e7e5e0] px-6 py-3 text-center text-sm font-medium transition hover:border-[#171717]"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={saving || duplicateBlocksForm}
              className="bg-[#b8925a] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#a67f49] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Creating..."
                : "Create Product"}
            </button>

          </div>

        </form>
      </section>

      {/* Manage Sizes Modal */}

      {manageSizesOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#171717]/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-sizes-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setManageSizesOpen(false);
              setEditingSize(null);
              setSizeToToggle(null);
              setSizeActionError("");
            }
          }}
        >
          <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#e7e5e0] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#b8925a]">
                  Catalogue
                </p>

                <h2
                  id="manage-sizes-title"
                  className="mt-2 text-xl font-semibold tracking-tight"
                >
                  Manage Sizes
                </h2>

                <p className="mt-1 text-xs text-[#888888]">
                  {categoryName.trim()
                    ? `Sizes for ${categoryName.trim()}`
                    : "Select a category first"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManageSizesOpen(false);
                  setEditingSize(null);
                  setSizeToToggle(null);
                  setSizeActionError("");
                  setSizeSearch("");
                  setNewSize("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-[#777777] transition-colors hover:bg-[#f8f7f4] hover:text-[#171717]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5">

              <div className="rounded-xl border border-[#e7e5e0] bg-[#f8f7f4] p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newSize}
                    onChange={(event) =>
                      setNewSize(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddSize();
                      }
                    }}
                    placeholder="Enter new size e.g. 50"
                    className="min-w-0 flex-1 border border-[#ddd8cf] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
                    disabled={!categoryName.trim() || addingSize}
                  />

                  <button
                    type="button"
                    onClick={handleAddSize}
                    disabled={addingSize || !categoryName.trim()}
                    className="border border-[#171717] bg-[#171717] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingSize ? "Adding..." : "Add Size"}
                  </button>
                </div>
              </div>

              {sizeActionError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {sizeActionError}
                </div>
              )}

              <div className="relative mt-5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>

                <input
                  type="text"
                  value={sizeSearch}
                  onChange={(event) =>
                    setSizeSearch(event.target.value)
                  }
                  placeholder="Search sizes..."
                  className="w-full rounded-lg border border-[#e7e5e0] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#b8925a]"
                />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#888888]">
                    All Sizes
                  </p>

                  <button
                    type="button"
                    onClick={loadSizesForManagement}
                    className="text-xs font-medium text-[#b8925a] transition-colors hover:text-[#171717]"
                  >
                    Refresh
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#e7e5e0]">
                  {managedSizes.length > 0 ? (
                    managedSizes.map((size) => (
                      <div
                        key={size.id}
                        className="flex items-center justify-between gap-4 border-b border-[#eeeae3] px-4 py-4 last:border-b-0"
                      >
                        {editingSize?.id === size.id ? (
                          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={editSizeName}
                              onChange={(event) =>
                                setEditSizeName(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  saveSizeEdit();
                                }

                                if (event.key === "Escape") {
                                  cancelEditingSize();
                                }
                              }}
                              autoFocus
                              className="min-w-0 flex-1 rounded-lg border border-[#d8d4cc] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#b8925a]"
                            />

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={cancelEditingSize}
                                disabled={savingSizeEdit}
                                className="rounded-lg border border-[#e7e5e0] px-3 py-2 text-xs font-medium text-[#666666] transition-colors hover:border-[#171717] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={saveSizeEdit}
                                disabled={savingSizeEdit}
                                className="rounded-lg bg-[#171717] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingSizeEdit ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#171717]">
                                Size {size.name}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    size.active
                                      ? "bg-emerald-500"
                                      : "bg-[#b8b5ae]"
                                  }`}
                                />

                                <span className="text-xs text-[#888888]">
                                  {size.active ? "Active" : "Inactive"}
                                </span>

                                {size.active && (
                                  <span className="text-xs text-[#b8925a]">
                                    {size.mapped
                                      ? "Available for this category"
                                      : "Not added to this category"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                              {size.active && !size.mapped && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddSizeToCategory(size)
                                  }
                                  disabled={
                                    addingSizeToCategory === size.id
                                  }
                                  className="rounded-lg border border-[#d8d4cc] bg-white px-3 py-2 text-xs font-medium text-[#555555] transition-colors hover:border-[#b8925a] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {addingSizeToCategory === size.id
                                    ? "Adding..."
                                    : "Add to Category"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  startEditingSize(size)
                                }
                                className="rounded-lg border border-[#d8d4cc] bg-white px-3 py-2 text-xs font-medium text-[#555555] transition-colors hover:border-[#b8925a] hover:text-[#171717]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setSizeToToggle(size)
                                }
                                disabled={
                                  sizeActionLoading === size.id
                                }
                                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                  size.active
                                    ? "border border-[#d8d4cc] bg-white text-[#555555] hover:border-[#171717] hover:text-[#171717]"
                                    : "bg-[#171717] text-white hover:bg-[#303030]"
                                }`}
                              >
                                {sizeActionLoading === size.id
                                  ? "Saving..."
                                  : size.active
                                  ? "Disable"
                                  : "Enable"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-[#888888]">
                      {sizeSearch.trim()
                        ? `No sizes found for "${sizeSearch.trim()}".`
                        : "No sizes found."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Overlay */}
            {sizeToToggle && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#171717]/25 px-6 backdrop-blur-[2px]">
                <div className="w-full max-w-md rounded-2xl border border-[#e7e5e0] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b8925a]">
                    Confirmation
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {sizeToToggle.active
                      ? `Disable size ${sizeToToggle.name}?`
                      : `Enable size ${sizeToToggle.name}?`}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#666666]">
                    {sizeToToggle.active
                      ? "This size will no longer appear in the Size selection when creating products. Existing products using this size will remain safe."
                      : "This size will become available again wherever it is mapped to a category."}
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSizeToToggle(null)}
                      className="border border-[#e7e5e0] px-5 py-2.5 text-sm font-medium text-[#555555] transition-colors hover:border-[#171717] hover:text-[#171717]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSize(sizeToToggle)
                      }
                      disabled={
                        sizeActionLoading === sizeToToggle.id
                      }
                      className="bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sizeActionLoading === sizeToToggle.id
                        ? "Saving..."
                        : sizeToToggle.active
                        ? "Disable"
                        : "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Designs Modal */}

      {manageDesignsOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#171717]/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-designs-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setManageDesignsOpen(false);
              setEditingDesign(null);
              setDesignToToggle(null);
              setDesignActionError("");
            }
          }}
        >

          <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#e7e5e0] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#b8925a]">
                  Catalogue
                </p>

                <h2
                  id="manage-designs-title"
                  className="mt-2 text-xl font-semibold tracking-tight"
                >
                  Manage Designs
                </h2>

                <p className="mt-1 text-xs text-[#888888]">
                  {categoryName.trim()
                    ? `Designs for ${categoryName.trim()}`
                    : "Select a category first"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManageDesignsOpen(false);
                  setEditingDesign(null);
                  setDesignToToggle(null);
                  setDesignActionError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-[#777777] transition-colors hover:bg-[#f8f7f4] hover:text-[#171717]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5">

              <div className="rounded-xl border border-[#e7e5e0] bg-[#f8f7f4] p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={newDesignName}
                    onChange={(event) =>
                      setNewDesignName(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddDesign();
                      }
                    }}
                    placeholder="Enter new design name"
                    className="min-w-0 flex-1 border border-[#ddd8cf] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
                    disabled={!categoryName.trim()}
                  />

                  <button
                    type="button"
                    onClick={handleAddDesign}
                    disabled={addingDesign || !categoryName.trim()}
                    className="border border-[#171717] bg-[#171717] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingDesign ? "Adding..." : "Add Design"}
                  </button>
                </div>
              </div>

              {designActionError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {designActionError}
                </div>
              )}

              <div className="relative mt-5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>

                <input
                  type="text"
                  value={designSearch}
                  onChange={(event) =>
                    setDesignSearch(event.target.value)
                  }
                  placeholder="Search designs..."
                  className="w-full rounded-lg border border-[#e7e5e0] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#b8925a]"
                />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#888888]">
                    All Designs
                  </p>

                  <button
                    type="button"
                    onClick={loadDesignsForManagement}
                    className="text-xs font-medium text-[#b8925a] transition-colors hover:text-[#171717]"
                  >
                    Refresh
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#e7e5e0]">
                  {managedDesigns.length > 0 ? (
                    managedDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="flex items-center justify-between gap-4 border-b border-[#eeeae3] px-4 py-4 last:border-b-0"
                      >
                        {editingDesign?.id === design.id ? (
                          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                              type="text"
                              value={editDesignName}
                              onChange={(event) =>
                                setEditDesignName(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  saveDesignEdit();
                                }

                                if (event.key === "Escape") {
                                  cancelEditingDesign();
                                }
                              }}
                              autoFocus
                              className="min-w-0 flex-1 rounded-lg border border-[#d8d4cc] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#b8925a]"
                            />

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={cancelEditingDesign}
                                disabled={savingDesignEdit}
                                className="rounded-lg border border-[#e7e5e0] px-3 py-2 text-xs font-medium text-[#666666] transition-colors hover:border-[#171717] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={saveDesignEdit}
                                disabled={savingDesignEdit}
                                className="rounded-lg bg-[#171717] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingDesignEdit ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#171717]">
                                {design.name}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    design.active
                                      ? "bg-emerald-500"
                                      : "bg-[#b8b5ae]"
                                  }`}
                                />

                                <span className="text-xs text-[#888888]">
                                  {design.active ? "Active" : "Inactive"}
                                </span>

                                {design.active && (
                                  <span className="text-xs text-[#b8925a]">
                                    {design.mapped
                                      ? "Available for this category"
                                      : "Not added to this category"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                              {design.active && !design.mapped && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddDesignToCategory(design)
                                  }
                                  disabled={
                                    addingDesignToCategory === design.id
                                  }
                                  className="rounded-lg border border-[#d8d4cc] bg-white px-3 py-2 text-xs font-medium text-[#555555] transition-colors hover:border-[#b8925a] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {addingDesignToCategory === design.id
                                    ? "Adding..."
                                    : "Add to Category"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  startEditingDesign(design)
                                }
                                className="rounded-lg border border-[#d8d4cc] bg-white px-3 py-2 text-xs font-medium text-[#555555] transition-colors hover:border-[#b8925a] hover:text-[#171717]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDesignToToggle(design)
                                }
                                disabled={
                                  designActionLoading === design.id
                                }
                                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                  design.active
                                    ? "border border-[#d8d4cc] bg-white text-[#555555] hover:border-[#171717] hover:text-[#171717]"
                                    : "bg-[#171717] text-white hover:bg-[#303030]"
                                }`}
                              >
                                {designActionLoading === design.id
                                  ? "Saving..."
                                  : design.active
                                  ? "Disable"
                                  : "Enable"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-[#888888]">
                      {designSearch.trim()
                        ? `No designs found for "${designSearch.trim()}".`
                        : "No designs found."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Overlay */}
            {designToToggle && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#171717]/25 px-6 backdrop-blur-[2px]">
                <div className="w-full max-w-md rounded-2xl border border-[#e7e5e0] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#b8925a]">
                    Confirmation
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {designToToggle.active
                      ? `Disable ${designToToggle.name}?`
                      : `Enable ${designToToggle.name}?`}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#666666]">
                    {designToToggle.active
                      ? "This design will no longer appear in the Design dropdown. Existing products using this design will remain safe."
                      : "This design will become available again wherever it is mapped to a category."}
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDesignToToggle(null)}
                      className="border border-[#e7e5e0] px-5 py-2.5 text-sm font-medium text-[#555555] transition-colors hover:border-[#171717] hover:text-[#171717]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleDesign(designToToggle)
                      }
                      disabled={
                        designActionLoading ===
                        designToToggle.id
                      }
                      className="bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {designActionLoading ===
                      designToToggle.id
                        ? "Saving..."
                        : designToToggle.active
                        ? "Disable"
                        : "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Manage Categories Modal */}

      {manageCategoriesOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171717]/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-categories-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setManageCategoriesOpen(
                false
              );
              setCategoryToToggle(
                null
              );
              setCategoryActionError(
                ""
              );
              setEditingCategory(
                null
              );
              setEditCategoryName(
                ""
              );
            }
          }}
        >

          <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]">

            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-[#e7e5e0] px-6 py-5">

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#b8925a]">
                  Catalogue
                </p>

                <h2
                  id="manage-categories-title"
                  className="mt-2 text-xl font-semibold tracking-tight"
                >
                  Manage Categories
                </h2>

                <p className="mt-1 text-xs text-[#888888]">
                  Rename, enable, or disable categories used
                  while creating products.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManageCategoriesOpen(
                    false
                  );
                  setCategoryToToggle(
                    null
                  );
                  setCategoryActionError(
                    ""
                  );
                  setCategorySearch(
                    ""
                  );
                  setEditingCategory(
                    null
                  );
                  setEditCategoryName(
                    ""
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-[#777777] transition-colors hover:bg-[#f8f7f4] hover:text-[#171717]"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* Modal Body */}

            <div className="overflow-y-auto px-6 py-5">

              {/* Add Category */}

              <div className="rounded-xl border border-[#e7e5e0] bg-[#f8f7f4] p-4">

                <div className="flex flex-col gap-3 sm:flex-row">

                  <input
                    type="text"
                    value={
                      newCategoryName
                    }
                    onChange={(event) =>
                      setNewCategoryName(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    placeholder="Enter new category name"
                    className="min-w-0 flex-1 border border-[#ddd8cf] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b8925a]"
                  />

                  <button
                    type="button"
                    onClick={
                      handleAddCategory
                    }
                    disabled={
                      addingCategory
                    }
                    className="border border-[#171717] bg-[#171717] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingCategory
                      ? "Adding..."
                      : "Add Category"}
                  </button>

                </div>

              </div>

              {/* Action Error */}

              {categoryActionError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {
                    categoryActionError
                  }
                </div>
              )}

              {/* Search Categories */}

              <div className="relative mt-5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>

                <input
                  type="text"
                  value={categorySearch}
                  onChange={(event) =>
                    setCategorySearch(
                      event.target.value
                    )
                  }
                  placeholder="Search categories..."
                  className="w-full rounded-lg border border-[#e7e5e0] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#b8925a]"
                />
              </div>

              {/* Category List */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#888888]">
                    All Categories
                  </p>

                  <button
                    type="button"
                    onClick={
                      loadCategoriesFromDatabase
                    }
                    className="text-xs font-medium text-[#b8925a] transition-colors hover:text-[#171717]"
                  >
                    Refresh
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#e7e5e0]">

                  {managedCategories.length >
                  0 ? (

                    managedCategories.map(
                      (category) => (
                        <div
                          key={
                            category.id
                          }
                          className="flex items-center justify-between gap-4 border-b border-[#eeeae3] px-4 py-4 last:border-b-0"
                        >

                          {editingCategory?.id === category.id ? (
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(event) =>
                                  setEditCategoryName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    saveCategoryEdit();
                                  }

                                  if (event.key === "Escape") {
                                    cancelEditingCategory();
                                  }
                                }}
                                autoFocus
                                className="min-w-0 flex-1 rounded-lg border border-[#d8d4cc] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#b8925a]"
                              />

                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditingCategory}
                                  disabled={savingCategoryEdit}
                                  className="rounded-lg border border-[#e7e5e0] px-3 py-2 text-xs font-medium text-[#666666] transition-colors hover:border-[#171717] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={saveCategoryEdit}
                                  disabled={savingCategoryEdit}
                                  className="rounded-lg bg-[#171717] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {savingCategoryEdit ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="min-w-0">

                                <p className="truncate text-sm font-medium text-[#171717]">
                                  {category.name}
                                </p>

                                <div className="mt-1 flex items-center gap-2">

                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      category.active
                                        ? "bg-emerald-500"
                                        : "bg-[#b8b5ae]"
                                    }`}
                                  />

                                  <span className="text-xs text-[#888888]">
                                    {category.active
                                      ? "Active"
                                      : "Inactive"}
                                  </span>

                                </div>

                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditingCategory(category)
                                  }
                                  className="rounded-lg border border-[#d8d4cc] bg-white px-3 py-2 text-xs font-medium text-[#555555] transition-colors hover:border-[#b8925a] hover:text-[#171717]"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setCategoryToToggle(category)
                                  }
                                  disabled={
                                    categoryActionLoading === category.id
                                  }
                                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                    category.active
                                      ? "border border-[#d8d4cc] bg-white text-[#555555] hover:border-[#171717] hover:text-[#171717]"
                                      : "bg-[#171717] text-white hover:bg-[#303030]"
                                  }`}
                                >
                                  {categoryActionLoading === category.id
                                    ? "Saving..."
                                    : category.active
                                    ? "Disable"
                                    : "Enable"}
                                </button>
                              </div>
                            </>
                          )}                        </div>
                      )
                    )

                  ) : (

                    <div className="px-4 py-8 text-center text-sm text-[#888888]">
                      {categorySearch.trim()
                        ? `No categories found for "${categorySearch.trim()}".`
                        : "No categories found."}
                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* Confirmation Overlay inside Modal */}

            {categoryToToggle && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#171717]/25 px-6 backdrop-blur-[2px]">

                <div className="w-full max-w-md rounded-2xl border border-[#e7e5e0] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

                  <p className="text-xs uppercase tracking-[0.2em] text-[#b8925a]">
                    Confirmation
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {categoryToToggle.active
                      ? `Disable ${categoryToToggle.name}?`
                      : `Enable ${categoryToToggle.name}?`}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#666666]">
                    {categoryToToggle.active
                      ? `This category will no longer appear in the Category dropdown when creating new products. Existing products using this category will remain safe.`
                      : `This category will become available again in the Category dropdown for new products.`}
                  </p>

                  <div className="mt-6 flex justify-end gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setCategoryToToggle(
                          null
                        )
                      }
                      className="border border-[#e7e5e0] px-5 py-2.5 text-sm font-medium text-[#555555] transition-colors hover:border-[#171717] hover:text-[#171717]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleCategory(
                          categoryToToggle
                        )
                      }
                      disabled={
                        categoryActionLoading ===
                        categoryToToggle.id
                      }
                      className="bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {categoryActionLoading ===
                      categoryToToggle.id
                        ? "Saving..."
                        : categoryToToggle.active
                        ? "Disable"
                        : "Enable"}
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}