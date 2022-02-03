import * as env from "./env"

export function actionDataSize(): u32 {
    return env.action_data_size();
}

export function readActionData(): u8[] {
    let size = env.action_data_size();
    var arr = new Array<u8>(size);
    
    let ptr = changetype<ArrayBufferView>(arr).dataStart;
    env.read_action_data(ptr, size);    
    return arr;
}
