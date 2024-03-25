import { useMemo, type RefObject, useState, useRef, FormEventHandler } from 'react';
import { z } from 'zod';

type OpaqueObject = Record<string, unknown> | unknown[];
type PossibleInput = HTMLInputElement | HTMLTextAreaElement;

const IS_NUMBER_REG = /^\d$/;
const isNumber = (value: string) => IS_NUMBER_REG.test(value);

const getNextObject = (object: OpaqueObject, key: string, restName: string[]): OpaqueObject => {
  const nextObject = Array.isArray(object) ? object[Number(key)] : object[key];
  if (nextObject !== undefined && nextObject !== null) return nextObject as OpaqueObject;

  const newObject = isNumber(restName[0]) ? [] : {};
  if (Array.isArray(object)) {
    object[Number(key)] = newObject;
  } else {
    object[key] = newObject;
  }

  return newObject;
};

const getValue = (element: PossibleInput) => {
  if (element.type === 'number' || element.dataset.inputType === 'number') return Number(element.value);

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

const getFormData = (formRef: RefObject<HTMLFormElement>) => {
  if (!formRef.current) return;

  const rootObject = {};
  const elements = [...formRef.current.elements];

  for (const element of elements) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) continue;
    if (!element.name) continue;

    insertElementDataIntoObjectFromSubName(element, rootObject, element.name.split('.'));
  }

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

export const flattenZodObject = (object: Record<string, unknown>): Record<string, string | undefined> => {
  const root = {};
  flattenObject(root, '', object);
  return root;
};

export const useZodForm = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, defaults?: Partial<z.infer<typeof schema>>) => {
  const formRef = useRef<HTMLFormElement>(null);
  const touchedInputValidity = useRef<Record<string, { value: string; validity: boolean }>>({});
  const d = useMemo(
    () => ({
      defaults: flattenZodObject(defaults || {}),
      defaultValid: schema.safeParse(defaults).success,
      getFormData: () => schema.safeParse(getFormData(formRef)),
    }),
    []
  );
  const [isValid, setIsValid] = useState(d.defaultValid);
  const onTouched = (inputName: string, isValid: boolean, value: string) => {
    const ref = touchedInputValidity.current[inputName];
    if (!ref || ref.validity !== isValid || ref.value !== value) {
      touchedInputValidity.current[inputName] = { validity: isValid, value };
      setIsValid(isValid && schema.safeParse(getFormData(formRef)).success);
    }
  };
  const onInputTouched: FormEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ currentTarget }) => {
    onTouched(currentTarget.name, currentTarget.validity.valid, currentTarget.value);
  };
  const canClose = () => {
    if (isValid) return true;
    formRef.current?.reportValidity();

    return false;
  };

  return { ...d, isValid, onTouched, onInputTouched, canClose, formRef };
};
