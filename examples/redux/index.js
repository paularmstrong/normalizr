import inquirer from 'inquirer';

inquirer.prompt([
  {
    type: 'input',
    name: 'repo',
    message: 'What is the slug of the repo you wish to browse?',
    default: 'paularmstrong/normalizr',
    validate: (input) => {
      if (!(/^[a-zA-Z0-9]+\/[a-zA-Z0-9]+/).test(input)) {
        return 'Repo slug must be in the form "user/project"';
      }
      return true;
    }
  }
]).then((answers) => {
  console.log(answers);
});
