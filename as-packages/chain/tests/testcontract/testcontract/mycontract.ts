import {
    Asset,
    Symbol,
    check,
    Contract,
} from "as-chain";

import { MyData } from "./mydata"
import { MyData2 } from "./mydata2/mydata2"
import { MyData3 } from "../mydata3/mydata3"

@contract
export class MyContract extends Contract {

    @action("testmydata")
    testMyData(
        data1: MyData,
        data2: MyData2,
        data3: MyData3,
        data4: Asset,
    ): void {
        check(data1.name == "data1", "bad value 1");
        check(data2.name == "data2", "bad value 2");
        check(data3.name == "data3", "bad value 3");
        check(data4 == new Asset(10000, new Symbol("EOS", 4)), "bad value 4");
    }
}