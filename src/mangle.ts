export function demangleProperty(object: any, name: string, value: any) : any {
  if (!object) {
    return;
  }
  object[name] = value;
  return object;
}

export function mangleProperty(object: any, name: string) : any {
  if (!object || !object.hasOwnProperty(name)) {
    return undefined;
  }
  return object[name];
}