import assert from 'assert';

import {
  AchievementGoal,
  AchievementItem,
  AchievementStatus,
  FilterStatus
} from '../../../features/achievement/AchievementTypes';

/**
 * An InferencerNode item encapsulates all important information of an achievement item
 *
 * @param {AchievementItem} achievement the achievement item
 * @param {number} dataIdx the key to retrive the achivement item in achievements[], i.e. achievements[dataIdx] = achievement
 * @param {number} maxExp total achievable EXP of the achievement
 * @param {number} progressFrac progress percentage in fraction. It is always between 0 to 1, both inclusive.
 * @param {AchievementStatus} status the achievement status
 * @param {Date | undefined} displayDeadline deadline displayed on the achievement card
 * @param {Set<number>} children a set of immediate prerequisites id
 * @param {Set<number>} descendant a set of all descendant prerequisites id (including immediate prerequisites)
 */
class InferencerNode {
  public achievement: AchievementItem;
  public dataIdx: number;
  public maxExp: number;
  public progressFrac: number;
  public status: AchievementStatus;
  public displayDeadline?: Date;
  public children: Set<number>;
  public descendant: Set<number>;

  constructor(achievement: AchievementItem, dataIdx: number) {
    const { deadline, prerequisiteIds, goals } = achievement;

    this.achievement = achievement;
    this.dataIdx = dataIdx;
    this.maxExp = this.generateMaxExp(goals);
    this.progressFrac = this.generateProgressFrac(goals);
    this.status = AchievementStatus.ACTIVE; // to be updated after the nodeList is constructed
    this.displayDeadline = deadline;
    this.children = new Set(prerequisiteIds);
    this.descendant = new Set(prerequisiteIds);
  }

  private generateMaxExp(goals: AchievementGoal[]) {
    return goals.reduce((exp, goal) => exp + goal.goalTarget, 0);
  }

  private generateProgressFrac(goals: AchievementGoal[]) {
    const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);

    return Math.min(progress / this.maxExp, 1);
  }
}

/**
 * Main Class which handles the assignment of ids to each and every Achievement in the system.
 */
class AchievementInferencer {
  private achievements: AchievementItem[] = []; // note: the achievement_id might not be the same as its array index
  private nodeList: Map<number, InferencerNode> = new Map(); // key = achievement_id, value = achievement node

  constructor(achievements: AchievementItem[]) {
    this.achievements = achievements;
    this.processData();
  }

  public doesAchievementExist(id: number) {
    return this.nodeList.get(id) !== undefined;
  }

  public getAchievements() {
    return this.achievements;
  }

  public getAchievementItem(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.achievement;
  }

  public insertAchievement(achievement: AchievementItem) {
    // first, generate a new unique id by finding the max id
    let newId = 0;
    if (this.achievements.length > 0) {
      newId = Math.max(...this.nodeList.keys(), 0) + 1;
    }

    // then assign the new unique id by overwriting the achievement item supplied by param
    // and append it to achievements[]
    achievement.id = newId;
    this.achievements.push(achievement);

    // finally, reconstruct the nodeList
    this.processData();

    return newId;
  }

  public modifyAchievement(achievement: AchievementItem) {
    // directly modify the achievement element in achievements
    assert(this.nodeList.has(achievement.id));
    const idx = this.nodeList.get(achievement.id)!.dataIdx;
    this.achievements[idx] = achievement;

    // then, reconstruct the nodeList
    this.processData();
  }

  public removeAchievement(id: number) {
    const hasChild = (achievement: AchievementItem) => achievement.prerequisiteIds.includes(id);

    const removeChild = (achievement: AchievementItem) =>
      achievement.prerequisiteIds.filter(child => child !== id);

    // create a copy of achievements that:
    // 1. does not contain the removed achievement
    // 2. does not contain reference of the removed achievement in other achievement's prerequisite
    const newAchievements: AchievementItem[] = [];
    this.achievements.forEach(achievement => {
      if (hasChild(achievement)) {
        // reference of the removed item is filtered out
        achievement.prerequisiteIds = removeChild(achievement);
      }
      if (achievement.id !== id) {
        // removed achievement is not included in the new achievements
        newAchievements.push(achievement);
      }
    });
    this.achievements = newAchievements;

    // finally, reconstruct the nodeList
    this.processData();
  }

  public listIds() {
    return this.achievements.map(achievement => achievement.id);
  }

  public listTaskIds() {
    return this.achievements.filter(achievement => achievement.isTask).map(task => task.id);
  }

  public listTaskIdsbyPosition() {
    return this.achievements
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position)
      .map(task => task.id);
  }

  public listNonTaskIds() {
    return this.achievements.filter(achievement => !achievement.isTask).map(nonTask => nonTask.id);
  }

  public setTask(achievement: AchievementItem) {
    achievement.isTask = true;
    achievement.position = this.listTaskIds().length;

    this.modifyAchievement(achievement);
    this.normalizePositions();
  }

  public setNonTask(achievement: AchievementItem) {
    achievement.prerequisiteIds = [];
    achievement.isTask = false;
    achievement.position = 0; // position 0 is reserved for non-task achievements

    this.modifyAchievement(achievement);
    this.normalizePositions();
  }

  // Calculates set bonus
  public getBonusExp(id: number) {
    assert(this.nodeList.has(id));
    if (this.nodeList.get(id)!.children.size === 0) return 0;

    const maxExp = this.nodeList.get(id)!.maxExp;

    let maxChildExp = 0;
    for (const childId of this.nodeList.get(id)!.children) {
      maxChildExp = maxChildExp + this.nodeList.get(childId)!.maxExp;
    }

    return maxExp - maxChildExp;
  }

  public getMaxExp(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.maxExp;
  }

  public getStudentExp(id: number) {
    assert(this.nodeList.has(id));
    const goals = this.nodeList.get(id)!.achievement.goals;

    return goals.reduce((progress, goal) => progress + goal.goalProgress, 0);
  }

  // total achievable EXP of all published achievements
  public getTotalExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalExp, node) => totalExp + node.maxExp, 0);
  }

  // total EXP earned by the student
  public getStudentTotalExp() {
    const publishedTask = this.listPublishedNodes().filter(node => node.achievement.isTask);

    return publishedTask.reduce((totalProgress, node) => {
      const goals = node.achievement.goals;
      const progress = goals.reduce((progress, goal) => progress + goal.goalProgress, 0);
      return totalProgress + progress;
    }, 0);
  }

  public getProgressFrac(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.progressFrac;
  }

  public getStatus(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.status;
  }

  public getDisplayDeadline(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.displayDeadline;
  }

  public isImmediateChild(id: number, childId: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.children.has(childId);
  }

  public getImmediateChildren(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.children;
  }

  public listImmediateChildren(id: number) {
    return [...this.getImmediateChildren(id)];
  }

  public isDescendant(id: number, childId: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.descendant.has(childId);
  }

  public getDescendants(id: number) {
    assert(this.nodeList.has(id));
    return this.nodeList.get(id)!.descendant;
  }

  public listDescendants(id: number) {
    return [...this.getDescendants(id)];
  }

  public listAvailablePrerequisites(id: number) {
    return this.listIds().filter(
      target => target !== id && !this.isDescendant(id, target) && !this.isDescendant(target, id)
    );
  }

  public getFilterCount(filterStatus: FilterStatus) {
    const published = this.listPublishedNodes();

    switch (filterStatus) {
      case FilterStatus.ALL:
        return published.length;
      case FilterStatus.ACTIVE:
        return published.filter(node => node.status === AchievementStatus.ACTIVE).length;
      case FilterStatus.COMPLETED:
        return published.filter(node => node.status === AchievementStatus.COMPLETED).length;
      default:
        return 0;
    }
  }

  // NOTE: positions of achievements are 1-indexed.
  public changeAchievementPosition(achievement: AchievementItem, newPosition: number) {
    const achievements = this.getAchievements()
      .filter(achievement => achievement.isTask)
      .sort((taskA, taskB) => taskA.position - taskB.position);

    const movedAchievement = achievements.splice(achievement.position - 1, 1)[0];
    achievements.splice(newPosition - 1, 0, movedAchievement);

    for (let i = Math.min(newPosition - 1, achievement.position); i < achievements.length; i++) {
      const editedAchievement = achievements[i];
      editedAchievement.position = i + 1;
    }
  }

  private processData() {
    this.constructNodeList();
    this.nodeList.forEach(node => {
      this.generateDescendant(node);
      this.generateDisplayDeadline(node);
      this.generateStatus(node);
    });
  }

  private constructNodeList() {
    this.nodeList = new Map();
    for (let idx = 0; idx < this.achievements.length; idx++) {
      const achievement = this.achievements[idx];
      this.nodeList.set(achievement.id, new InferencerNode(achievement, idx));
    }
  }

  // Recursively append grandchildren's id to children, O(N) operation
  private generateDescendant(node: InferencerNode) {
    for (const childId of node.descendant) {
      if (childId === node.achievement.id) {
        console.error('Circular dependency detected');
      }
      assert(this.nodeList.has(childId));
      for (const grandchildId of this.nodeList.get(childId)!.descendant) {
        // Newly added grandchild is appended to the back of the set.
        node.descendant.add(grandchildId);
        // Hence the great grandchildren will be added when the iterator reaches there
      }
    }
  }

  // Set the node's display deadline by comparing with all descendants' deadlines
  private generateDisplayDeadline(node: InferencerNode) {
    const now = new Date();

    // Comparator of two deadlines
    const compareDeadlines = (
      displayDeadline: Date | undefined,
      currentDeadline: Date | undefined
    ) => {
      if (currentDeadline === undefined || currentDeadline <= now) {
        // currentDeadline undefined or expired, nothing change
        return displayDeadline;
      } else if (displayDeadline === undefined) {
        return currentDeadline;
      } else {
        // currentDeadline unexpired, displayDeadline may be expired or unexpired
        // display the closest unexpired deadline
        return displayDeadline <= now || currentDeadline < displayDeadline
          ? currentDeadline
          : displayDeadline;
      }
    };

    // Temporary array of all descendants' deadlines
    const descendantDeadlines = [];
    for (const childId of node.descendant) {
      assert(this.nodeList.has(childId));
      const childDeadline = this.nodeList.get(childId)!.achievement.deadline;
      descendantDeadlines.push(childDeadline);
    }

    // Reduces the temporary array to a single Date value
    node.displayDeadline = descendantDeadlines.reduce(compareDeadlines, node.displayDeadline);
  }

  private generateStatus(node: InferencerNode) {
    const now = new Date();
    const deadline = node.displayDeadline;
    if (deadline !== undefined && deadline.getTime() <= now.getTime()) {
      // deadline elapsed
      if (node.progressFrac === 0) {
        return (node.status = AchievementStatus.EXPIRED); // not attempted
      } else {
        return (node.status = AchievementStatus.COMPLETED); // attempted
      }
    } else {
      // deadline not elapsed
      if (node.progressFrac === 1) {
        return (node.status = AchievementStatus.COMPLETED); // fully completed
      } else {
        return (node.status = AchievementStatus.ACTIVE); // not fully completed
      }
    }
  }

  // normalize positions
  private normalizePositions() {
    this.achievements.sort((a, b) => a.position - b.position);

    // position 0 is reserved for non-task achievements
    const nonTaskPosition = 0;
    let newPosition = 1;

    for (let idx = 0; idx < this.achievements.length; idx++) {
      if (this.achievements[idx].isTask) {
        this.achievements[idx].position = newPosition++;
      } else {
        this.achievements[idx].position = nonTaskPosition;
      }
    }
  }

  private listPublishedNodes() {
    // returns an array of Node that are published to the achievement page
    return this.listTaskIds().reduce((arr, id) => {
      assert(this.nodeList.has(id));
      const node = this.nodeList.get(id)!;
      arr.push(node); // including task achievement
      for (const child of node.children) {
        assert(this.nodeList.has(child));
        arr.push(this.nodeList.get(child)!); // including immediate prerequisites
      }
      return arr;
    }, [] as InferencerNode[]);
  }
}

export default AchievementInferencer;
