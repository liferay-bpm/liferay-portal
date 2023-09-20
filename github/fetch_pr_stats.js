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

    const prCount = {
      'totalCount': pullRequests.length,
      'squad-alpha': 0,
      'squad-bravo': 0,
      'squad-zulu': 0,
      'External Team': 0,
      'Author Action Required': 0,
      'Dev Approved': 0,
    }
    
    let assignees = {};
    let assignee;

    const countLabel = (labels, tagetLabel) => {
      if (labels.some(e => e.name === tagetLabel)) {
        prCount[tagetLabel] += 1;
      }
    }


    for(i in pullRequests){
      let labels = pullRequests[i].labels;

      countLabel(labels, 'squad-alpha')
      countLabel(labels, 'squad-bravo')
      countLabel(labels, 'squad-zulu')
      countLabel(labels, 'External Team')
      countLabel(labels, 'Author Action Required')
      countLabel(labels, 'Dev Approved')

      if(!pullRequests[i].assignee){
        assignee = "No-ASSIGNEE"
      }else{
        assignee = pullRequests[i].assignee.login
      }

      if(!assignees[assignee]){

        assignees[assignee] = {}

        assignees[assignee].total = 0
        assignees[assignee].reviewed = 0
        assignees[assignee].blocked = 0

      }

      assignees[assignee].total += 1

      if (labels.some(e => e.name === 'Author Action Required' ||
          labels.some(e => e.name === 'Dev Approved'))) {
        assignees[assignee].reviewed += 1
      }

      if (labels.some(e => e.name === 'Blocked')){
        assignees[assignee].blocked += 1
      }

    }

    console.log(`--------------------------Open Pull Requests---------------------------`);
    console.log(`Total: ${prCount['totalCount']}`);
    console.log(`-----------------------------------------------------------------------`);
    console.log(`Squad Alpha: ${prCount['squad-alpha']}`);
    console.log(`Squad Bravo: ${prCount['squad-bravo']}`);
    console.log(`Squad Zulu: ${prCount['squad-zulu']}`);
    console.log(`-----------------------------------------------------------------------`);
    console.log(`External Teams: ${prCount['External Team']}`);
    console.log(`-----------------------------------------------------------------------`);
    console.log(`Author Action Required: ${prCount['Author Action Required']}`);
    console.log(`Dev Approved: ${prCount['Dev Approved']}`);
    console.log(`-----------------------------------------------------`);
    console.log(`Assignees: `);

    for (const key in assignees) {
      console.log(`${key} : ${assignees[key].total} (${assignees[key].total - assignees[key].reviewed} to review - ${assignees[key].blocked} Blocked)`);

    }

  } catch (error) {
    
    console.error(error);
    process.exit(1);
  }
}

fetchPRStatistics();