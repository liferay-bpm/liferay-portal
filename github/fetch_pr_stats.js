const { Octokit } = require("octokit");

// Use o token de acesso pessoal para autenticar as chamadas à API do GitHub
const octokit = new Octokit({
  auth: process.argv[2],
});

async function fetchPRStatistics() {
  try {
    const owner = "liferay-objects";
    const repo = "liferay-portal";

    const { data: pullRequests } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
    });

    const prCount = pullRequests.length;
    const countSquads = [0, 0, 0];
    let assignees = {};


    for(i in pullRequests){
      let labels = pullRequests[i].labels;

      if (labels.some(e => e.name === 'squad-alpha')) {
        countSquads[0] += 1;
      }

      if (labels.some(e => e.name === 'squad-bravo')) {
        countSquads[1] += 1;
      }

      if (labels.some(e => e.name === 'squad-zulu')) {
        countSquads[2] += 1;
      }

      if(assignees[pullRequests[i].assignee.login]){
        assignees[pullRequests[i].assignee.login] += 1
      }else{
        assignees[pullRequests[i].assignee.login] = 1
      }

    }

    console.log(`Total Open Pull Requests: ${prCount}`);
    console.log(`Open Pull Requests - Squad Alpha: ${countSquads[0]}`);
    console.log(`Open Pull Requests - Squad Bravo: ${countSquads[1]}`);
    console.log(`Open Pull Requests - Squad Zulu: ${countSquads[2]}`);
    console.log(`Assignees: `);
    console.log(assignees);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fetchPRStatistics();