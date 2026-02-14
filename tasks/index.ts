import { task } from "hardhat/config";
import type { NewTaskDefinition } from "hardhat/types/tasks";

export const blockNumberTask: NewTaskDefinition = task(
  "block-number",
  "Get current block number"
)
  .setAction(() => import("./block-number.js"))
  .build();


// 导出所有 tasks
export const allTasks = [blockNumberTask];
