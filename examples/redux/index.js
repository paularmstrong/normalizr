import inquirer from 'inquirer';
import store from './src/redux';
import * as Action from './src/redux/actions';

const REPO = 'paularmstrong/normalizr';

const start = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'repo',
      message: 'What is the slug of the repo you wish to browse?',
      default: REPO,
      validate: (input) => {
        if (!(/^[a-zA-Z0-9]+\/[a-zA-Z0-9]+/).test(input)) {
          return 'Repo slug must be in the form "user/project"';
        }
        return true;
      }
    }
  ]).then(({ repo }) => {
    store.dispatch(Action.setRepo(repo));
    main();
  });
};

const main = () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'Browse current state',
        'Get new data',
        new inquirer.Separator(),
        'Reset state',
        new inquirer.Separator(),
        'Quit'
      ]
    }
  ]).then(({ action }) => {
    switch(action) {
      case 'Browse current state':
        return browse();
      case 'Get new data':
        return pull();
      case 'Reset state':
        return reset();
      default:
        return process.exit();
    }
  });
};

const browse = () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'browseAction',
      message: 'What would you like to do?',
      choices: () => {
        return [
          { value: 'print', name: 'Print the entire state tree' },
          new inquirer.Separator(),
          ...Object.keys(store.getState()).map((value) => ({ value, name: `Print the "${value}" state` })),
          new inquirer.Separator(),
          { value: 'main', name: 'Go Back to Main Menu' }
        ];
      }
    }
  ]).then((answers) => {
    switch(answers.browseAction) {
      case 'main':
        return main();
      case 'print':
        console.log(JSON.stringify(store.getState(), null, 2));
        return browse();
      default:
        console.log(JSON.stringify(store.getState()[answers.browseAction], null, 2));
        return browse();
    }
  });
};

const pull = ({ repo }) => {

};

const reset = () => {

};

start();
