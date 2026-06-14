import {
  FileInput,
  Input,
  InputWithColorLabelContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
  MultiLineInput,
  NodeInput,
  NodeMultiLineInput,
  Toggle,
} from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { Select } from '@ds/Select';
import { inputAttrs } from '@utils/inputAttrs';
import { basename } from '@utils/path';
import React, { useMemo, useRef, useState } from 'react';
import { z } from 'zod';

type WithSchemaKeyAndName = {
  name: string;
  schemaKey?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReactProps<T extends (...args: any) => any> = Omit<Parameters<T>[0], 'name'> & WithSchemaKeyAndName;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReactPropsWithLabel<T extends (...args: any) => any> = Omit<Parameters<T>[0], 'name'> &
  WithSchemaKeyAndName & { label?: string; labelLeft?: boolean };

type ResourceInputFieldProps = Omit<ReactProps<typeof FileInput>, 'onFileChoosen' | 'onFileClear' | 'filePath'> & {
  filename: string;
};

const createResourceInputField = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Record<string, unknown>) => {
  const ResourceInputField = ({ name, schemaKey, filename, ...props }: ResourceInputFieldProps) => {
    const { type, ...attrs } = inputAttrs(schema, name, defaults, schemaKey);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState((defaults?.[name] as string) ?? '');
    const filePath = value ? `${props.destFolderToCopy}/${value}` : '';

    const onFileChoosen = (filePath: string) => {
      const newValue = basename(filePath);
      if (!inputRef?.current) return;

      inputRef.current.value = newValue;
      setValue(newValue);
    };

    const onFileClear = () => {
      if (!inputRef?.current) return;

      inputRef.current.value = '';
      setValue('');
    };

    return (
      <>
        <input ref={inputRef} {...attrs} style={{ display: 'none' }} />
        {value ? (
          <FileInput onFileChoosen={onFileChoosen} onFileClear={onFileClear} filePath={filePath} name={filename} {...props} />
        ) : (
          <DropInput onFileChoosen={onFileChoosen} name={filename} {...props} />
        )}
      </>
    );
  };
  return ResourceInputField;
};

export const useInputAttrs = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Record<string, unknown>) => {
  return useMemo(
    () => ({
      Input: ({ name, schemaKey, ...props }: ReactProps<typeof Input>) => <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />,
      EmbeddedUnitInput: ({ name, schemaKey, ...props }: ReactProps<typeof EmbeddedUnitInput>) => (
        <EmbeddedUnitInput lang="en" {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
      ),
      MultiLineInput: ({ name, schemaKey, ...props }: ReactProps<typeof Input>) => (
        <MultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
      ),
      Select: ({ name, schemaKey, ...props }: ReactProps<typeof Select>) => {
        const { type, ...attrs } = inputAttrs(schema, name, defaults, schemaKey);
        return <Select {...attrs} {...props} />;
      },
      Toggle: ({ name, schemaKey, ...props }: ReactProps<typeof Toggle>) => {
        const { type, required, ...attrs } = inputAttrs(schema, name, defaults, schemaKey);
        const defaultChecked = attrs.defaultValue === 'true';
        return <Toggle {...attrs} {...props} defaultChecked={props.defaultChecked ?? defaultChecked} />;
      },
      ResourceInput: ({ ...props }: ResourceInputFieldProps) => {
        const ResourceInputField = useMemo(() => createResourceInputField(schema, defaults), []);
        return <ResourceInputField {...props} />;
      },
    }),
    [schema, defaults],
  );
};

export const useInputAttrsWithLabel = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Record<string, unknown>) => {
  return useMemo(
    () => ({
      Input: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof Input>) => {
        if (!label) return <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          if (props.type === 'color') {
            return (
              <InputWithColorLabelContainer>
                <Label>{label}</Label>
                <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
              </InputWithColorLabelContainer>
            );
          } else {
            return (
              <InputWithLeftLabelContainer>
                <Label>{label}</Label>
                <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
              </InputWithLeftLabelContainer>
            );
          }

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <Input {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
          </InputWithTopLabelContainer>
        );
      },
      EmbeddedUnitInput: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof EmbeddedUnitInput>) => {
        if (!label) return <EmbeddedUnitInput lang="en" {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <EmbeddedUnitInput lang="en" {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <EmbeddedUnitInput lang="en" {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
          </InputWithTopLabelContainer>
        );
      },
      MultiLineInput: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof Input>) => {
        if (!label) return <MultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <MultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <MultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
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
      Toggle: ({ name, schemaKey, label, ...props }: ReactProps<typeof Toggle>) => {
        const { type, required, ...attrs } = inputAttrs(schema, name, defaults, schemaKey);
        const defaultChecked = attrs.defaultValue === 'true';
        if (!label) return <Toggle {...attrs} {...props} defaultChecked={props.defaultChecked ?? defaultChecked} />;

        return (
          <InputWithLeftLabelContainer>
            <Label>{label}</Label>
            <Toggle {...attrs} {...props} defaultChecked={props.defaultChecked ?? defaultChecked} />
          </InputWithLeftLabelContainer>
        );
      },
      ResourceInput: ({ label, ...props }: ResourceInputFieldProps & { label?: string }) => {
        const ResourceInputField = useMemo(() => createResourceInputField(schema, defaults), []);
        if (!label) return <ResourceInputField {...props} />;

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <ResourceInputField {...props} />
          </InputWithTopLabelContainer>
        );
      },
    }),
    [schema, defaults],
  );
};

export const useNodeInputAttrsWithLabel = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Record<string, unknown>) => {
  return useMemo(
    () => ({
      Input: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof Input>) => {
        if (!label) return <NodeInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <NodeInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <NodeInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
          </InputWithTopLabelContainer>
        );
      },
      MultiLineInput: ({ name, schemaKey, label, labelLeft, ...props }: ReactPropsWithLabel<typeof Input>) => {
        if (!label) return <NodeMultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />;

        if (labelLeft)
          return (
            <InputWithLeftLabelContainer>
              <Label>{label}</Label>
              <NodeMultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
            </InputWithLeftLabelContainer>
          );

        return (
          <InputWithTopLabelContainer>
            <Label>{label}</Label>
            <NodeMultiLineInput {...inputAttrs(schema, name, defaults, schemaKey)} {...props} />
          </InputWithTopLabelContainer>
        );
      },
    }),
    [schema, defaults],
  );
};
