import { CONFIG } from "../config/compile";

export const mainTpl = `

export function apply(receiver: u64, firstReceiver: u64, action: u64): void {
	const _receiver = new _chain.Name(receiver);
	const _firstReceiver = new _chain.Name(firstReceiver);
	const _action = new _chain.Name(action);

	const mycontract = new {{contract.className}}(_receiver, _firstReceiver, _action);
	const actionData = _chain.readActionData();

	if (receiver == firstReceiver) {
		{{#each contract.actionFuncDefs}}
		{{{handleAction .}}}
		{{/each}}
	}
  
	if (receiver != firstReceiver) {
		{{#each contract.actionFuncDefs}}{{{handleNotifyAction .}}}{{/each}}
	}
    {{#if contract.hasFinalizeFunc}}
	mycontract.finalize();
    {{/if}}
	return;
}
`;

// contractInfo.contract.actionFuncDefs.forEach(message => {
//   let _message = <ActionFunctionDef>message;
//   let actionName = _message.messageDecorator.actionName;
//   if (!EosioUtils.isValidName(actionName)) {
//       throw new Error(`Invalid action name: ${actionName}. Trace: ${RangeUtil.location(message.declaration.range)}`);
//   }
//   console.log("++++++_message.messageDecorator.actionName:", _message.messageDecorator.actionName);
//   console.log("++++++_message.messageDecorator.notify:", _message.messageDecorator.notify);
// });