import * as Action from './src/redux/actions';
import * as Selector from './src/redux/selectors';
import inquirer from 'inquirer';
import store from './src/redux';

const REPO = 'paularmstrong/normalizr';

const start = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'repo',
        message: 'What is the slug of the repo you wish to browseMain?',
        default: REPO,
        validate: (input) => {
          if (!/^[a-zA-Z0-9]+\/[a-zA-Z0-9]+/.test(input)) {
            return 'Repo slug must be in the form "user/project"';
          }
          return true;
        },
      },
    ])
    .then(({ repo }) => {
      store.dispatch(Action.setRepo(repo));
      main();
    });
};

const main = () => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['Browse current state', 'Get new data', new inquirer.Separator(), 'Quit'],
      },
    ])
    .then(({ action }) => {
      switch (action) {
        case 'Browse current state':
          return browseMain();
        case 'Get new data':
          return pull();
        default:
          return process.exit();
      }
    });
};

const browseMain = () => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'browseMainAction',
        message: 'What would you like to do?',
        choices: () => {
          return [
            { value: 'print', name: 'Print the entire state tree' },
            new inquirer.Separator(),
            ...Object.keys(store.getState()).map((value) => ({ value, name: `Browse ${value}` })),
            new inquirer.Separator(),
            { value: 'main', name: 'Go Back to Main Menu' },
          ];
        },
      },
    ])
    .then((answers) => {
      switch (answers.browseMainAction) {
        case 'main':
          return main();
        case 'print':
          console.log(JSON.stringify(store.getState(), null, 2));
          return browseMain();
        default:
          return browse(answers.browseMainAction);
      }
    });
};

const browse = (stateKey) => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: `Browse ${stateKey}`,
        choices: [
          { value: 'count', name: 'Show # of Objects' },
          { value: 'keys', name: 'List All Keys' },
          { value: 'view', name: 'View by Key' },
          { value: 'all', name: 'View All' },
          { value: 'denormalize', name: 'Denormalize' },
          new inquirer.Separator(),
          { value: 'browseMain', name: 'Go Back to Browse Menu' },
          { value: 'main', name: 'Go Back to Main Menu' },
        ],
      },
      {
        type: 'list',
        name: 'list',
        message: `Select the ${stateKey} to view:`,
        choices: Object.keys(store.getState()[stateKey]),
        when: ({ action }) => action === 'view',
      },
    ])
    .then(({ action, list }) => {
      const state = store.getState()[stateKey];
      if (list) {
        console.log(JSON.stringify(state[list], null, 2));
      }
      switch (action) {
        case 'count':
          console.log(`-> ${Object.keys(state).length} items.`);
          return browse(stateKey);
        case 'keys':
          Object.keys(state).map((key) => console.log(key));
          return browse(stateKey);
        case 'all':
          console.log(JSON.stringify(state, null, 2));
          return browse(stateKey);
        case 'denormalize':
          return browseDenormalized(stateKey);
        case 'browseMain':
          return browseMain();
        case 'main':
          return main();
        default:
          return browse(stateKey);
      }
    });
};

const browseDenormalized = (stateKey) => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'selector',
        message: `Denormalize a/and ${stateKey} entity`,
        choices: [
          ...Object.keys(store.getState()[stateKey]),
          new inquirer.Separator(),
          { value: 'browse', name: 'Go Back to Browse Menu' },
          { value: 'main', name: 'Go Back to Main Menu' },
        ],
      },
    ])
    .then(({ selector }) => {
      switch (selector) {
        case 'browse':
          return browse(stateKey);
        case 'main':
          return main();
        default: {
          const data = Selector[`select${stateKey.replace(/s$/, '')}`](store.getState(), selector);
          console.log(JSON.stringify(data, null, 2));
          return browseDenormalized(stateKey);
        }
      }
    });
};

const pull = () => {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'pullAction',
        message: 'What data would you like to fetch?',
        choices: () => {
          return [
            ...Object.keys(store.getState()).map((value) => ({ value, name: value })),
            new inquirer.Separator(),
            { value: 'main', name: 'Go Back to Main Menu' },
          ];
        },
      },
    ])
    .then((answers) => {
      switch (answers.pullAction) {
        case 'commits':
          return store.dispatch(Action.getCommits()).then(pull);
        case 'issues':
          return store.dispatch(Action.getIssues()).then(pull);
        case 'labels':
          return store.dispatch(Action.getLabels()).then(pull);
        case 'milestones':
          return store.dispatch(Action.getMilestones()).then(pull);
        case 'pullRequests':
          return store.dispatch(Action.getPullRequests()).then(pull);
        case 'main':
        default:
          return main();
      }
    });
};

start();
