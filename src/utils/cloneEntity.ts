/**
 * Use this function instead of structuredClone as it might not be defined everywhere and actually returns any
 */
export const cloneEntity = <T>(entity: T): T => {
  // TODO: structuredClone doesn't work if the object is a proxy ; the proxy are created by react-tracked ; quick fix
  //if (structuredClone) return structuredClone(entity); // Might only be defined on front-end
  if (entity === undefined) return entity; // We can't stringify undefined

  return JSON.parse(JSON.stringify(entity));
};
