const forggetingCurve = [
    1 * 24 * 60,    // 1 day
    2 * 24 * 60,    // 2 day
    4 * 24 * 60,    // 4 day
    7 * 24 * 60,    // 7 day
    15 * 24 * 60    // 15 day
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const needReview = (problem) => {
    if (problem.proficiency >= forggetingCurve.length) {
        return false;
    }

    const currentTime = Date.now();
    const timeDiffInMinute = (currentTime - problem.submissionTime) / (1000 * 60);
    console.log(`timeDiffInMinute: ${timeDiffInMinute}`);
    return timeDiffInMinute >= forggetingCurve[problem.proficiency];
};


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

const getNextReviewTime = (problem) => {
    return new Date(problem.submissionTime + forggetingCurve[problem.proficiency] * 60 * 1000);
}

const create_review_problem_record = (problem) => {
    const nextReviewDate = getNextReviewTime(problem);
    const htmlTag = 
    `\
    <tr>\
        <td style="width: 40%;"><a target="_blank" href=${problem.url}><small>${problem.name}</small><a/></td>\
        <td>\
            <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">\
                <div class="progress-bar progress-bar-striped bg-success" style="width: ${problem.proficiency / 5 * 100}%; font-size: smaller; color: black"><small><small><small>${problem.proficiency / 5 * 100}%</small></small></small></div>\
            </div>\
        </td>\
        <td><small>${decorateProblemLevel(problem.level)}</small></td>\
        <td><small>${Math.round((Date.now() - nextReviewDate) / (60 * 1000))} hours</small></td>\
    </tr>\
    `;
    return htmlTag; 
;
}

const create_schedule_problem_record = (problem) => {
    const nextReviewDate = getNextReviewTime(problem);
    console.log(nextReviewDate);
    const htmlTag = 
    `\
    <tr>\
        <td style="width: 40%;"><a target="_blank" href=${problem.url}><small>${problem.name}</small><a/></td>\
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

const create_completed_problem_record = (problem) => {
    const htmlTag = 
    `\
    <tr>\
        <td style="width: 40%;"><a target="_blank" href=${problem.url}><small>${problem.name}</small><a/></td>\
        <td>\
            <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">\
                <div class="progress-bar progress-bar-striped bg-success" style="width: ${problem.proficiency / 5 * 100}%; font-size: smaller; color: black"><small><small><small>${problem.proficiency / 5 * 100}%</small></small></small></div>\
            </div>\
        </td>\
        <td><small>${decorateProblemLevel(problem.level)}</small></td>\
    </tr>\
    `;
    return htmlTag; 
;
}

const create_review_table_content = (problems) => {
    let content_html = 
    '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Level</th>\
            <th>Delay</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';

    problems.sort((p1, p2) => {
        return getNextReviewTime(p1).valueOf() - getNextReviewTime(p2).valueOf();
    })

    let keys = Object.keys(problems);
    for (const i of keys) {
        content_html += create_review_problem_record(problems[i]) + '\n';
    }
    content_html += `</tbody>`
    return content_html;
}

const create_schedule_table_content = (problems) => {
    let content_html = 
    '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Level</th>\
            <th>Review Time</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';

    problems.sort((p1, p2) => {
        return getNextReviewTime(p1).valueOf() - getNextReviewTime(p2).valueOf();
    })

    let keys = Object.keys(problems);
    for (const i of keys) {
        content_html += create_schedule_problem_record(problems[i]) + '\n';
    }
    content_html += `</tbody>`
    return content_html;
}

const create_completed_table_content = (problems) => {
    let content_html = 
    '\
    <thead>\
        <tr style="font-size: smaller">\
            <th>Problem</th>\
            <th>Progress</th>\
            <th>Level</th>\
        </tr>\
    </thead>\
    <tbody>\
    ';

    problems.sort((p1, p2) => {
        return p2.submissionTime - p1.submissionTime;
    })

    let keys = Object.keys(problems);
    for (const i of keys) {
        content_html += create_completed_problem_record(problems[i]) + '\n';
    }
    content_html += `</tbody>`

    return content_html;
}


const display_table = () => {
    
    chrome.storage.local.get('cn_mode', (result) => {
        let cnMode;
        if (result.cn_mode === undefined) {
            cnMode = false;
        } else {
            cnMode = result.cn_mode;
        }

        console.log(`current in cn_mode: ${cnMode}`);


        const switchButtonDom = document.getElementById("switchButton");
        if (cnMode) {
            switchButtonDom.setAttribute("checked", "checked");
        } else {
            switchButtonDom.removeAttribute("checked");
        }

        const labelDom = document.getElementById("siteLabel");
        if (cnMode) {
            labelDom.innerHTML = "LeetCode - China ";
        } else {
            labelDom.innerHTML = "LeetCode - Global";
        }
        
        const queryKey = cnMode ? "cn_records" : "records";
        chrome.storage.local.get(queryKey, (result) => {
            const problems = Object.values(result[queryKey]);
    
            const needReviewProblems = problems.filter(p => needReview(p));
            const completedProblems = problems.filter(p => p.proficiency === 5);
            const reviewScheduledProblems = problems.filter(p => !needReview(p) && p.proficiency < 5);
            document.getElementById("need-review-table").innerHTML = create_review_table_content(needReviewProblems);
            document.getElementById("no-review-table").innerHTML = create_schedule_table_content(reviewScheduledProblems);
            document.getElementById("completed-table").innerHTML = create_completed_table_content(completedProblems);
        })
    })
}

document.getElementById("switchButton").addEventListener('click', (event) => {
    chrome.storage.local.get('cn_mode', (result) => {
        let cnMode;
        if (result.cn_mode === undefined) {
            cnMode = false;
        } else {
            cnMode = result.cn_mode;
        }

        chrome.storage.local.set({'cn_mode': !cnMode});
        console.log(`changed cn_mode to ${!cnMode}`);
        display_table();
    });
});

display_table();

