import { setModeSwitchHandlers } from "./modeSwitchHandler";
import { setPageJumpHandlers } from "./pageJumpHandler"
import { setRecordOperationHandlers } from "./recordOperationHandler";

export const registerAllHandlers = () => {
    setPageJumpHandlers();
    setModeSwitchHandlers();
    setRecordOperationHandlers();
}