import * as PrismaSchemaDSL from "prisma-schema-dsl";
import { types } from "amplication-data";
import { pascalCase } from "pascal-case";
import {
  Entity,
  EntityField,
  EnumDataType,
  EnumPrivateDataType,
} from "../types";

export const CLIENT_GENERATOR = PrismaSchemaDSL.createGenerator(
  "client",
  "prisma-client-js"
);

export const DATA_SOURCE = {
  name: "postgres",
  provider: PrismaSchemaDSL.DataSourceProvider.PostgreSQL,
  url: new PrismaSchemaDSL.DataSourceURLEnv("POSTGRESQL_URL"),
};

export async function createPrismaSchema(
  entities: Entity[],
  entityIdToName: Record<string, string>
): Promise<string> {
  const models = entities.map((entity) =>
    createPrismaModel(entity, entityIdToName)
  );

  const enums = entities
    .flatMap((entity) => entity.fields)
    .map((field) => createPrismaEnum(field))
    .filter((enum_): enum_ is PrismaSchemaDSL.Enum => enum_ !== null);

  const schema = PrismaSchemaDSL.createSchema(models, enums, DATA_SOURCE, [
    CLIENT_GENERATOR,
  ]);

  return PrismaSchemaDSL.print(schema);
}

export function createPrismaEnum(
  field: EntityField
): PrismaSchemaDSL.Enum | null {
  const { dataType, properties } = field;
  switch (dataType) {
    case EnumDataType.MultiSelectOptionSet:
    case EnumDataType.OptionSet: {
      const { options } = properties as types.OptionSet;
      return PrismaSchemaDSL.createEnum(
        createEnumName(field),
        options.map((option) => option.value)
      );
    }
    default: {
      return null;
    }
  }
}

function createEnumName(field: EntityField): string {
  return `Enum${pascalCase(field.name)}`;
}

export function createPrismaModel(
  entity: Entity,
  entityIdToName: Record<string, string>
): PrismaSchemaDSL.Model {
  return PrismaSchemaDSL.createModel(
    entity.name,
    entity.fields.map((field) => createPrismaField(field, entityIdToName))
  );
}

export function createPrismaField(
  field: EntityField,
  entityIdToName: Record<string, string>
): PrismaSchemaDSL.ScalarField | PrismaSchemaDSL.ObjectField {
  const { dataType, name, properties } = field;
  switch (dataType) {
    case EnumDataType.SingleLineText: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.MultiLineText: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.Email: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.AutoNumber: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Int,
        false,
        true
      );
    }
    case EnumDataType.WholeNumber: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Int,
        false,
        true
      );
    }
    case EnumDataType.DateTime: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.DateTime,
        false,
        true
      );
    }
    case EnumDataType.DecimalNumber: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Float,
        false,
        true
      );
    }
    case EnumDataType.Boolean: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.Boolean,
        false,
        true
      );
    }
    case EnumDataType.GeographicAddress: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true
      );
    }
    case EnumDataType.Lookup: {
      const {
        relatedEntityId,
        allowMultipleSelection,
      } = properties as types.Lookup;
      return PrismaSchemaDSL.createObjectField(
        name,
        entityIdToName[relatedEntityId],
        allowMultipleSelection,
        true
      );
    }
    case EnumDataType.MultiSelectOptionSet: {
      return PrismaSchemaDSL.createObjectField(
        name,
        createEnumName(field),
        true,
        true
      );
    }
    case EnumDataType.OptionSet: {
      return PrismaSchemaDSL.createObjectField(
        name,
        createEnumName(field),
        false,
        true
      );
    }
    case EnumDataType.Id: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        false,
        true,
        false,
        true,
        false,
        new PrismaSchemaDSL.CallExpression(PrismaSchemaDSL.CUID)
      );
    }
    case EnumDataType.CreatedAt: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.DateTime,
        false,
        true,
        false,
        false,
        false,
        new PrismaSchemaDSL.CallExpression(PrismaSchemaDSL.NOW)
      );
    }
    case EnumDataType.UpdatedAt: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.DateTime,
        false,
        true,
        false,
        false,
        true
      );
    }
    case EnumPrivateDataType.Roles: {
      return PrismaSchemaDSL.createScalarField(
        name,
        PrismaSchemaDSL.ScalarType.String,
        true,
        field.required
      );
    }
    default: {
      throw new Error(`Unfamiliar data type: ${dataType}`);
    }
  }
}
