import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { z } from 'zod';
import { inputAttrs } from './inputAttrs';
import React, { useMemo } from 'react';
import { Select } from '@ds/Select';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';

type WithSchemaKeyAndName = {
  name: string;
  schemaKey?: string;
};

type ReactProps<T extends (...args: any) => any> = Omit<Parameters<T>[0], 'name'> & WithSchemaKeyAndName;

export const useInputAttrs = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Record<string, unknown>) => {
  return useMemo(
    () => ({
      Input: ({ name, schemaKey, ...props }: ReactProps<typeof Input>) => <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />,
      EmbeddedUnitInput: ({ name, schemaKey, ...props }: ReactProps<typeof EmbeddedUnitInput>) => (
        <EmbeddedUnitInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
      ),
      Select: ({ name, schemaKey, ...props }: ReactProps<typeof Select>) => {
        const { type, ...attrs } = inputAttrs(schema, name, defaults, schemaKey);
        return <Select {...attrs} {...props} />;
      },
    }),
    [schema, defaults]
  );
};

type ReactPropsWithLabel<T extends (...args: any) => any> = Omit<Parameters<T>[0], 'name'> &
  WithSchemaKeyAndName & { label?: string; labelLeft?: boolean };

export const useInputAttrsWithLabel = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Record<string, unknown>) => {
  return useMemo(
    () => ({
      Input: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof Input>) => {
        if (!label) return <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
          </InputWithTopLabelContainer>
        );
      },
      EmbeddedUnitInput: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof EmbeddedUnitInput>) => {
        if (!label) return <EmbeddedUnitInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <EmbeddedUnitInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <EmbeddedUnitInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
          </InputWithTopLabelContainer>
        );
      },
      Select: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof Select>) => {
        const { type, ...attrs } = inputAttrs(schema, name, defaults, schemaKey);
        if (!label) return <Select {...attrs} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <Select {...attrs} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <Select {...attrs} {...props} />
          </InputWithTopLabelContainer>
        );
      },
    }),
    [schema, defaults]
  );
};
