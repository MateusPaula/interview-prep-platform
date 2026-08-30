import type { Difficulty } from "./difficulty";
import type { Topic } from "./topic";

export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  topic: Topic;
  difficulty: Difficulty;
  starterCode: string;
}
