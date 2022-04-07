import {
    check,
    TimePoint,
    TimePointSec,
    print,
    Contract
} from "as-chain";

@contract
class MyContract extends Contract{
    @action("test")
    testSerializer(
        a1: TimePoint,
        a2: TimePointSec,
    ): void {
        check(a1 == new TimePoint(1630642401*1000000), "bad a1");
        check(a1 >= new TimePoint(1630642401*1000000), "bad a1");
        check(a1 <= new TimePoint(1630642401*1000000), "bad a1");

        check(a2 == new TimePointSec(1630642401), "bad a2");
        check(a2 >= new TimePointSec(1630642401), "bad a2");
        check(a2 <= new TimePointSec(1630642401), "bad a2");


        let _a1 = a1 - new TimePoint(1);
        check(a1 > _a1, "a1 > _a1");
        check(_a1 < a1, "_a1 < a1");
        check(a1 != _a1, "a1 != _a1");

        _a1 = _a1 + new TimePoint(1);
        check(_a1 == a1, "bad _a1");


        _a1 = a1 * new TimePoint(2);
        _a1 = _a1 / new TimePoint(2);

        check(a1 == _a1, "1. a1 == _a1");



        let _a2 = a2 - new TimePointSec(1);
        check(a2 > _a2, "a2 > _a2");
        check(_a2 < a2, "_a2 < a2");
        check(a2 != _a2, "a2 != _a2");
        _a2 = _a2 + new TimePointSec(1);
        check(_a2 == a2, "bad _a1");

        _a2 = a2 * new TimePointSec(2);
        _a2 = _a2 / new TimePointSec(2);

        check(a2 == _a2, "1. a2 == _a2");
        print("done!");
    }
}
