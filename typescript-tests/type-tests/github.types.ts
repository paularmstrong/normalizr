import { normalize, schema } from '../../src';

const user = new schema.Entity('users');

const label = new schema.Entity('labels');

const milestone = new schema.Entity('milestones', {
  creator: user,
});

const issue = new schema.Entity('issues', {
  assignee: user,
  assignees: [user],
  labels: label,
  milestone,
  user,
});

const pullRequest = new schema.Entity('pullRequests', {
  assignee: user,
  assignees: [user],
  labels: label,
  milestone,
  user,
});

const issueOrPullRequest = new schema.Array(
  {
    issues: issue,
    pullRequests: pullRequest,
  },
  (entity: any) => (entity.pull_request ? 'pullRequests' : 'issues')
);

const data = {
  /* ...*/
};
const normalizedData = normalize(data, issueOrPullRequest);
console.log(normalizedData);
