export function mangleProperty(object: any, name: string) : any {
  if (!object || !object.hasOwnProperty(name)) {
    return undefined;
  }
  return object[name];
}