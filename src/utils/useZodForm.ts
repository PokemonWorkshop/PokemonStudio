import { useMemo, type RefObject, useState, useRef, FormEventHandler, InputHTMLAttributes } from 'react';
import { z } from 'zod';
import { isStringPositiveInteger } from './isStringPositiveInteger';

type OpaqueObject = Record<string, unknown> | unknown[];
type PossibleInput = HTMLInputElement | HTMLTextAreaElement;
type TouchedInputValidity = Record<string, { value: string; validity: boolean }>;

const getNextObject = (object: OpaqueObject, key: string, restName: string[]): OpaqueObject => {
  const nextObject = Array.isArray(object) ? object[Number(key)] : object[key];
  if (nextObject !== undefined && nextObject !== null) return nextObject as OpaqueObject;

  const newObject = isStringPositiveInteger(restName[0]) ? [] : {};
  if (Array.isArray(object)) {
    object[Number(key)] = newObject;
  } else {
    object[key] = newObject;
  }

  return newObject;
};

const getValue = (element: PossibleInput) => {
  if ((element.type === 'number' && element.value !== '') || element.dataset.inputType === 'number') return Number(element.value);
  if (element instanceof HTMLInputElement && element.type === 'checkbox') return element.checked;
  if (element.value === '') {
    if (element.dataset.inputEmptyType === 'null') return null;
    if (element.dataset.inputEmptyDefaultValue) return element.dataset.inputEmptyDefaultValue;
  }

  return element.value;
};

const insertElementDataIntoObjectFromKey = (element: PossibleInput, object: OpaqueObject, key: string) => {
  const value = getValue(element);

  if (Array.isArray(object)) {
    object[Number(key)] = value;
  } else {
    object[key] = value;
  }
};

const insertElementDataIntoObjectFromSubName = (element: PossibleInput, object: OpaqueObject, subNames: string[]) => {
  const [key, ...restName] = subNames;
  if (restName.length === 0) return insertElementDataIntoObjectFromKey(element, object, key);

  const nextObject = getNextObject(object, key, restName);
  insertElementDataIntoObjectFromSubName(element, nextObject, restName);
};

type FixtureBeforeValidationFunction = (object: Record<string, unknown>) => Record<string, unknown>;

const getFormData = (formRef: RefObject<HTMLFormElement>, fixturesBeforeValidation?: FixtureBeforeValidationFunction) => {
  if (!formRef.current) return {} as Record<string, unknown>;

  const rootObject = {};
  const elements = [...formRef.current.elements];

  for (const element of elements) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) continue;
    if (!element.name) continue;

    insertElementDataIntoObjectFromSubName(element, rootObject, element.name.split('.'));
  }

  if (fixturesBeforeValidation) return fixturesBeforeValidation(rootObject);

  return rootObject as Record<string, unknown>;
};

const isOpaqueObject = (v: unknown): v is OpaqueObject => Array.isArray(v) || (typeof v === 'object' && v !== null);

const insertObjectInFlatteObject = (root: Record<string, unknown>, key: string, k: string | number, value: unknown) => {
  const newKey = key ? `${key}.${k}` : `${k}`;
  if (isOpaqueObject(value)) {
    flattenObject(root, newKey, value);
  } else {
    root[newKey] = `${value}`;
  }
};

const flattenObject = (root: Record<string, unknown>, key: string, object: OpaqueObject) => {
  if (Array.isArray(object)) return object.forEach((v, i) => insertObjectInFlatteObject(root, key, i, v));

  Object.entries(object).forEach(([k, v]) => insertObjectInFlatteObject(root, key, k, v));
};

const flattenZodObject = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  object: Partial<z.infer<typeof schema>>
): Record<string, string | undefined> => {
  const root = {};
  const shape = schema.shape;
  flattenObject(root, '', Object.fromEntries(Object.entries(object).filter(([key]) => key in shape)));
  return root;
};

const buildCanClose =
  <T extends z.ZodRawShape>(
    formRef: RefObject<HTMLFormElement>,
    schema: z.ZodObject<T>,
    getRawFormData: () => Record<string, unknown>,
    defaults: Record<string, string | undefined>
  ) =>
  () => {
    if (schema.safeParse(getRawFormData()).success) return true;
    if (!formRef.current) return false;

    for (const element of [...formRef.current.elements]) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) continue;
      if (!element.name) continue;
      if (element.validity.valid) continue;

      const defaultValue = defaults[element.name];
      if (defaultValue !== undefined) element.value = defaultValue;
    }

    if (schema.safeParse(getRawFormData()).success) return true;

    formRef.current?.reportValidity();
    return false;
  };

const formData = <T extends z.ZodRawShape>(
  formRef: RefObject<HTMLFormElement>,
  schema: z.ZodObject<T>,
  inputDefaults?: Partial<z.infer<typeof schema>>,
  fixturesBeforeValidation?: (objectToValidate: z.infer<typeof schema>) => z.infer<typeof schema>
) => {
  const defaults = flattenZodObject(schema, inputDefaults ?? {});
  const getRawFormData = () => getFormData(formRef, fixturesBeforeValidation as unknown as FixtureBeforeValidationFunction);

  return {
    formRef,
    defaults,
    defaultValid: schema.safeParse(inputDefaults).success,
    getFormData: () => schema.safeParse(getRawFormData()),
    getRawFormData,
    canClose: buildCanClose(formRef, schema, getRawFormData, defaults),
  };
};

export const useZodForm = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  defaults?: Partial<z.infer<typeof schema>>,
  fixturesBeforeValidation?: (objectToValidate: z.infer<typeof schema>) => z.infer<typeof schema>
) => {
  const formRef = useRef<HTMLFormElement>(null);
  const touchedInputValidity = useRef<TouchedInputValidity>({});
  const d = useMemo(() => formData(formRef, schema, defaults, fixturesBeforeValidation), [schema]);
  const [isValid, setIsValid] = useState(d.defaultValid);

  const onTouched = (inputName: string, isValid: boolean, value: string) => {
    const ref = touchedInputValidity.current[inputName];
    if (ref && ref.validity === isValid && ref.value === value) return;

    touchedInputValidity.current[inputName] = { validity: isValid, value };
    setIsValid(isValid && schema.safeParse(d.getRawFormData()).success);
  };
  const onInputTouched: FormEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ currentTarget }) => {
    onTouched(currentTarget.name, currentTarget.validity.valid, currentTarget.value);
  };

  return { ...d, isValid, onTouched, onInputTouched };
};
