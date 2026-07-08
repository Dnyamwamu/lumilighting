import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows";

const categoriesHierarchy = [
  {
    name: "Lighting",
    children: [
      {
        name: "Indoor Lighting",
        children: [
          "LED Bulbs",
          "Ceiling Lights",
          "Chandeliers",
          "Pendant Lights",
          "Wall Lights",
          "Downlights",
          "Track Lighting"
        ]
      },
      {
        name: "Commercial Lighting",
        children: [
          "LED Panels",
          "Office Lighting",
          "High Bay Lights",
          "Low Bay Lights"
        ]
      },
      {
        name: "Outdoor Lighting",
        children: [
          "Floodlights",
          "Garden Lights",
          "Security Lighting",
          "Street Lighting",
          "Outdoor Wall Lights"
        ]
      }
    ]
  },
  {
    name: "Electrical Accessories",
    children: [
      { name: "Switches" },
      { name: "Sockets" },
      { name: "Extension Cables" }
    ]
  },
  {
    name: "Solar Lighting",
    children: [
      { name: "Solar Floodlights" },
      { name: "Solar Garden Lights" },
      { name: "Solar Street Lights" },
      { name: "Solar Wall Lights" }
    ]
  },
  {
    name: "Smart Lighting",
    children: [
      { name: "Smart Bulbs" },
      { name: "Smart Switches" },
      { name: "Smart Controllers" },
      { name: "Smart Sensors" }
    ]
  },
  {
    name: "Lighting Components",
    children: [
      { name: "LED Drivers" },
      { name: "Transformers" },
      { name: "Connectors" },
      { name: "Mounting Accessories" },
      { name: "Control Gear" }
    ]
  },
  {
    name: "Decorative Lighting",
    children: [
      { name: "String Lights" },
      { name: "Fairy Lights" },
      { name: "Rope Lights" },
      { name: "Neon Flex Lights" },
      { name: "Decorative Lamps" }
    ]
  },
  {
    name: "Industrial Lighting",
    children: [
      { name: "Explosion-Proof Lights" },
      { name: "Warehouse Lights" },
      { name: "Factory Lights" },
      { name: "Canopy Lights" }
    ]
  }
];

const collectionsData = [
  { title: "Featured Products", handle: "featured-products" },
  { title: "Best Sellers", handle: "best-sellers" },
  { title: "New Arrivals", handle: "new-arrivals" },
  { title: "On Sale", handle: "on-sale" },
  { title: "Premium Collection", handle: "premium-collection" },
  { title: "Energy Saving Collection", handle: "energy-saving" },
  { title: "Office Lighting Solutions", handle: "office-lighting-solutions" },
  { title: "Home Lighting Solutions", handle: "home-lighting-solutions" },
  { title: "Contractor Specials", handle: "contractor-specials" },
  { title: "Luxury Chandeliers", handle: "luxury-chandeliers" },
  { title: "Solar Deals", handle: "solar-deals" },
];

export default async function seed_nested_categories({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  // 1. Clean up existing categories recursively from leaves up to roots
  logger.info("Cleaning up existing product categories...");
  while (true) {
    const categories = await productModuleService.listProductCategories(
      {},
      { select: ["id", "parent_category_id"] }
    );

    if (categories.length === 0) {
      break;
    }

    // A category is a parent if its ID is referenced as a parent_category_id by another category
    const parentIds = new Set(
      categories
        .map((c: any) => c.parent_category_id)
        .filter((id): id is string => !!id)
    );

    // Leaf categories are those whose IDs are NOT in the parentIds set
    const leafCategoryIds = categories
      .filter((c) => !parentIds.has(c.id))
      .map((c) => c.id);

    if (leafCategoryIds.length === 0) {
      // Safety exit if we somehow have categories but none are leaves (e.g. cycle)
      logger.warn("Potential circular dependency in category tree. Attempting force deletion of remaining categories...");
      const remainingIds = categories.map((c) => c.id);
      try {
        await productModuleService.deleteProductCategories(remainingIds);
      } catch (err) {
        logger.error(`Force deletion failed: ${err}`);
      }
      break;
    }

    await productModuleService.deleteProductCategories(leafCategoryIds);
    logger.info(`Deleted ${leafCategoryIds.length} leaf categories.`);
  }

  // 2. Clean up existing collections
  logger.info("Cleaning up existing product collections...");
  const existingCollections = await productModuleService.listProductCollections(
    {},
    { select: ["id"] }
  );

  if (existingCollections.length > 0) {
    const ids = existingCollections.map((c: any) => c.id);
    await productModuleService.deleteProductCollections(ids);
    logger.info(`Deleted ${existingCollections.length} existing collections.`);
  }

  // 3. Seed nested category hierarchy
  logger.info("Seeding nested category hierarchy...");
  for (const parent of categoriesHierarchy) {
    logger.info(`Creating parent category: ${parent.name}`);
    
    const { result: [parentCategory] } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: parent.name,
            is_active: true,
          },
        ],
      },
    });

    if (parent.children) {
      for (const child of parent.children) {
        logger.info(`  Creating child category: ${child.name}`);
        
        const { result: [childCategory] } = await createProductCategoriesWorkflow(container).run({
          input: {
            product_categories: [
              {
                name: child.name,
                parent_category_id: parentCategory.id,
                is_active: true,
              },
            ],
          },
        });

        if ("children" in child && child.children) {
          logger.info(`    Creating grandchild categories under: ${child.name}`);
          
          await createProductCategoriesWorkflow(container).run({
            input: {
              product_categories: child.children.map((grandchildName) => ({
                name: grandchildName,
                parent_category_id: childCategory.id,
                is_active: true,
              })),
            },
          });
        }
      }
    }
  }

  // 4. Seed product collections
  logger.info("Seeding product collections...");
  await productModuleService.createProductCollections(collectionsData);
  logger.info(`Seeded ${collectionsData.length} collections.`);

  logger.info("Category and collection seeding completed successfully!");
}
