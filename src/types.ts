import { z } from "zod";

const IdentifierSchema = z.object({
  type: z.literal("Identifier"),
  name: z.string(),
});

const ExpectIdentifierSchema = IdentifierSchema.extend({
  name: z.literal("expect"),
});

export const ExpectMemberExpressionSchema = z.object({
  type: z.literal("CallExpression"),
  arguments: z.array(z.any()),
  callee: z.object({
    type: z.literal("MemberExpression"),
    object: z.object({
      type: z.literal("CallExpression"),
      callee: ExpectIdentifierSchema,
      arguments: z.array(z.any()),
    }),
    property: z.object({
      name: z.string(),
    }),
  }),
});

export const ExpectNotMemberExpressionSchema = z.object({
  type: z.literal("CallExpression"),
  arguments: z.array(z.any()),
  callee: z.object({
    type: z.literal("MemberExpression"),
    object: z.object({
      type: z.literal("MemberExpression"),
      property: z.object({ name: z.literal("not") }),
      object: z.object({
        type: z.literal("CallExpression"),
        arguments: z.array(z.any()),
      }),
    }),
    property: z.object({
      name: z.string(),
    }),
  }),
});
