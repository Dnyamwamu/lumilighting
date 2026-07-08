import {
  defineMiddlewares,
  validateAndTransformQuery,
  validateAndTransformBody,
  authenticate,
} from "@medusajs/framework/http";
import { z } from "zod";
import { SearchSchema } from "./store/products/search/route";
import { PostInvoiceConfgSchema } from "./admin/invoice-config/route";
import { CreateQuote, GetQuoteParams } from "./store/validators";
import { listAdminQuoteQueryConfig } from "./admin/quotes/query-config";
import { AdminGetQuoteParams } from "./admin/quotes/validators";
import { listStoreQuoteQueryConfig } from "./store/customers/me/quotes/query-config";
import { PostStoreCreateRestockSubscription } from "./store/restock-subscriptions/validators";
import { PostStoreCreateWishlistItem } from "./store/customers/me/wishlists/items/validators";
import { CreateCategoryImagesSchema } from "./admin/categories/[category_id]/images/route";
import {
  DeleteCategoryImagesSchema,
  UpdateCategoryImagesSchema,
} from "./admin/categories/[category_id]/images/batch/route";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/product-feed",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(
          z.object({
            currency_code: z.string(),
            country_code: z.string(),
          }),
          {},
        ),
      ],
    },
    {
      matcher: "/store/products/search",
      method: ["POST"],
      middlewares: [validateAndTransformBody(SearchSchema)],
    },
    {
      matcher: "/admin/invoice-config",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostInvoiceConfgSchema)],
    },
    {
      method: ["POST"],
      matcher: "/store/customers/me/quotes",
      middlewares: [validateAndTransformBody(CreateQuote)],
    },
    {
      matcher: "/store/customers/me/quotes*",
      middlewares: [
        validateAndTransformQuery(GetQuoteParams, listStoreQuoteQueryConfig),
      ],
    },
    {
      matcher: "/admin/quotes*",
      middlewares: [
        validateAndTransformQuery(
          AdminGetQuoteParams,
          listAdminQuoteQueryConfig,
        ),
      ],
    },
    {
      matcher: "/store/restock-subscriptions",
      method: "POST",
      middlewares: [
        authenticate("customer", ["bearer", "session"], {
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(PostStoreCreateRestockSubscription),
      ],
    },
    {
      matcher: "/store/customers/me/wishlists/items",
      method: "POST",
      middlewares: [validateAndTransformBody(PostStoreCreateWishlistItem)],
    },
    {
      matcher: "/admin/categories/:category_id/images",
      method: ["POST"],
      middlewares: [validateAndTransformBody(CreateCategoryImagesSchema)],
    },
    {
      matcher: "/admin/categories/:category_id/images/batch",
      method: ["POST"],
      middlewares: [validateAndTransformBody(UpdateCategoryImagesSchema)],
    },
    {
      matcher: "/admin/categories/:category_id/images/batch",
      method: ["DELETE"],
      middlewares: [validateAndTransformBody(DeleteCategoryImagesSchema)],
    },
  ],
});
