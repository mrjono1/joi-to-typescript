import Joi from "joi";

import { convertObject } from "../index";

test("02.fromFiles", () => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    propertyName1: Joi.boolean().required()
  })
    .label("TestSchema")
    .description("a test schema definition");

  const dd = convertObject(schema);
  console.log(dd);
  console.log(dd[0].content);

  expect(true).toBe(true);
});
