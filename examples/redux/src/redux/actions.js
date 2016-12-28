export { getCommits } from './modules/commits';
export { getIssues } from './modules/issues';
export { getLabels } from './modules/labels';
export { getMilestones } from './modules/milestones';
export { getPullRequests } from './modules/pull-requests';
export { setRepo } from './modules/repos';

export const ADD_ENTITIES = 'ADD_ENTITIES';
export const addEntities = (entities) => ({
  type: ADD_ENTITIES,
  payload: entities
});
