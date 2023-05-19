import j from "jscodeshift";
import { z } from "zod";

type ExpressionKind =
  | j.Identifier
  | j.FunctionExpression
  | j.ThisExpression
  | j.ArrayExpression
  | j.ObjectExpression
  | j.Literal
  | j.SequenceExpression
  | j.UnaryExpression
  | j.BinaryExpression
  | j.AssignmentExpression
  | j.MemberExpression
  | j.UpdateExpression
  | j.LogicalExpression
  | j.ConditionalExpression
  | j.NewExpression
  | j.CallExpression
  | j.ArrowFunctionExpression
  | j.YieldExpression
  | j.GeneratorExpression
  | j.ComprehensionExpression
  | j.ClassExpression
  | j.Super
  | j.TaggedTemplateExpression
  | j.TemplateLiteral
  | j.MetaProperty
  | j.AwaitExpression
  | j.ImportExpression
  | j.ChainExpression
  | j.OptionalCallExpression
  | j.OptionalMemberExpression
  | j.JSXIdentifier
  | j.JSXExpressionContainer
  | j.JSXElement
  | j.JSXFragment
  | j.JSXMemberExpression
  | j.JSXText
  | j.PrivateName
  | j.TypeCastExpression
  | j.DoExpression
  | j.BindExpression
  | j.ParenthesizedExpression
  | j.DirectiveLiteral
  | j.StringLiteral
  | j.NumericLiteral
  | j.BigIntLiteral
  | j.NullLiteral
  | j.BooleanLiteral
  | j.RegExpLiteral
  | j.Import
  | j.TSAsExpression
  | j.TSNonNullExpression
  | j.TSTypeParameter
  | j.TSTypeAssertion;

const ExpressionKind = z.custom<ExpressionKind>(() => true);

const SpreadElement = z.custom<j.SpreadElement>(() => true);

const Identifier = z
  .object({
    type: z.literal("Identifier"),
    name: z.string(),
  })
  .passthrough()
  .pipe(z.custom<j.Identifier>(() => true));

const ExpectIdentifierSchema = z
  .object({
    type: z.literal("Identifier"),
    name: z.literal("expect"),
  })
  .passthrough();
export const ExpectMemberExpressionSchema = z.object({
  type: z.literal("CallExpression"),
  arguments: z.array(z.union([ExpressionKind, SpreadElement])),
  callee: z.object({
    type: z.literal("MemberExpression"),
    object: z.object({
      type: z.literal("CallExpression"),
      callee: ExpectIdentifierSchema,
      arguments: z.array(z.union([ExpressionKind, SpreadElement])),
    }),
    property: z.object({
      name: z.string(),
    }),
  }),
});

export const ExpectNotMemberExpressionSchema = z.object({
  type: z.literal("CallExpression"),
  arguments: z.array(z.union([ExpressionKind, SpreadElement])),
  callee: z.object({
    type: z.literal("MemberExpression"),
    object: z.object({
      type: z.literal("MemberExpression"),
      property: z.object({ name: z.literal("not") }),
      object: z.object({
        type: z.literal("CallExpression"),
        arguments: z.array(z.union([ExpressionKind, SpreadElement])),
      }),
    }),
    property: z.object({
      name: z.string(),
    }),
  }),
});
