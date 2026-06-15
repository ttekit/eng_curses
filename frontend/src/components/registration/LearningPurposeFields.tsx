import type { ChangeEvent } from "react";
import LabelRegister from "../LabelRegister";
import InputText from "../InputText";
import { TimeToAchieveField } from "../TimeToAchieveField";

type LearningPurposeLabels = {
  goalTitle: string;
  optional: string;
  goalLead: string;
  pointOfLearning: string;
  timeToAchieve: string;
  placeholderGoal: string;
};

type TimeUnitLabels = {
  day: string;
  month: string;
  year: string;
  unitSelectAria: string;
};

type LearningPurposeFieldsProps = {
  learningGoal: string;
  timeToAchieve: string;
  labels: LearningPurposeLabels;
  unitLabels: TimeUnitLabels;
  onLearningGoalChange: (value: string) => void;
  onTimeToAchieveChange: (value: string) => void;
};

export function LearningPurposeFields({
  learningGoal,
  timeToAchieve,
  labels,
  unitLabels,
  onLearningGoalChange,
  onTimeToAchieveChange,
}: LearningPurposeFieldsProps) {
  const handleLearningGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
    onLearningGoalChange(e.target.value);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <h2 className="font-display text-lg font-semibold">
          {labels.goalTitle}{" "}
          <span className="font-normal text-muted-foreground">
            {labels.optional}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">{labels.goalLead}</p>
      </div>
      <div className="space-y-2">
        <LabelRegister isRequired={false}>{labels.pointOfLearning}</LabelRegister>
        <InputText
          name="learningGoal"
          value={learningGoal}
          onChange={handleLearningGoalChange}
          type="text"
          placeholder={labels.placeholderGoal}
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <LabelRegister isRequired={false}>{labels.timeToAchieve}</LabelRegister>
        <TimeToAchieveField
          id="registration-time-to-achieve"
          value={timeToAchieve}
          allowEmpty
          onChange={onTimeToAchieveChange}
          unitLabels={unitLabels}
        />
      </div>
    </div>
  );
}
