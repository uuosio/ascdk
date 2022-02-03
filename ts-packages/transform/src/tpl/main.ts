import { CONFIG } from "../config/compile";

let scope = CONFIG.scope;

export const mainTpl = `
export function apply(receiver: u64, firstReceiver: u64, action: u64): void {
  let {{contract.instanceName}} = new {{contract.className}}();
  {{contract.instanceName}}.apply(receiver, firstReceiver, action);
  return;
}
`;
