import Joi from "joi";

import { convertObject } from "../index";

test("basic", () => {
  const schema = Joi.object({
    name: Joi.string(),
  })
    .label("TestSchema")
    .description("a test schema definition");

  convertObject(schema);
});
