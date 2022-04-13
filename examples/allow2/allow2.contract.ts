import { Name } from 'as-chain';
import { AllowContract } from '../allow/allow.contract';

@contract
export class ABC extends AllowContract {
    abc: Name = this.receiver
}