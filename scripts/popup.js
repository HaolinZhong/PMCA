const forggetingCurve = [
    1 * 24 * 60,    // 1 day
    2 * 24 * 60,    // 2 day
    4 * 24 * 60,    // 4 day
    7 * 24 * 60,    // 7 day
    15 * 24 * 60    // 15 day
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const decorateProblemLevel = (level) => {
    let color;
    if (level === "Easy") {
        color = "rgb(67, 160, 71)";
    } else if (level === "Medium") {
        color = "rgb(239, 108, 0)";
    } else {
        color = "rgb(233, 30, 99)";
    }
    return `<p style="color: ${color}">${level}</p>`
}

const create_problem_record = (problem) => {
    const nextReviewDate = new Date(problem.submissionTime + forggetingCurve[problem.proficiency] * 60 * 1000);
    const htmlTag = 
    `\
    <tr>\
        <td><a target="_blank" href=${problem.url}><small>${problem.name}</small><a/></td>\
        <td>\
            <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">\
                <div class="progress-bar progress-bar-striped bg-success" style="width: ${problem.proficiency / 5 * 100}%; font-size: smaller; color: black"><small><small><small>${problem.proficiency / 5 * 100}%</small></small></small></div>\
            </div>\
        </td>\
        <td><small>${decorateProblemLevel(problem.level)}</small></td>\
        <td><small>${months[nextReviewDate.getMonth()]} ${nextReviewDate.getDate()} ${nextReviewDate.getHours()}:${nextReviewDate.getMinutes()}</small></td>\
    </tr>\
    `;
    return htmlTag; 
;
}



const create_table_content = (problems) => {
    let content_html = 
    '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Difficulty</th>\
            <th>NextReviewTime</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';
    let keys = Object.keys(problems);
    for (const i of keys) {
        content_html += create_problem_record(problems[i]) + '\n';
    }
    content_html += `</tbody>`
    return content_html;
}

const display_table = () => {
    chrome.storage.local.get("problems", (problems) => {
        console.log(problems.problems);
        document.getElementById("need-review-table").innerHTML = create_table_content(problems.problems);
    })
}

display_table();