import { loadConfigs } from "../service/configService";
import { submissionListener } from "./submission";

console.log(`Hello PMCA!`);

await loadConfigs();
document.addEventListener('click', submissionListener);

