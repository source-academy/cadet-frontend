import { Button } from '@blueprintjs/core';

import AchievementInferencer from '../../../utils/AchievementInferencer';
import { achievementTemplate } from '../AchievementTemplate';

type AchievementAdderProps = {
  inferencer: AchievementInferencer;
  adderId: number;
  setAdderId: any;
};

function AchievementAdder(props: AchievementAdderProps) {
  const { inferencer, adderId, setAdderId } = props;

  const handleAddAchievement = () => {
    const newId = inferencer.insertAchievement(achievementTemplate);
    setAdderId(newId);
  };

  const disableAdder = adderId !== -1;

  return (
    <Button
      className="main-adder"
      onClick={handleAddAchievement}
      text={'Add A New Item'}
      disabled={disableAdder}
    />
  );
}

export default AchievementAdder;
