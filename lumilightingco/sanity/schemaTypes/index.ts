import { type SchemaTypeDefinition } from "sanity"
import hero from "./hero"
import promo from "./promo"
import testimonial from "./testimonial"
import faq from "./faq"
import blog from "./blog"
import about from "./about"
import quickTag from "./quickTag"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [hero, promo, testimonial, faq, blog, about, quickTag],
}
