const create_problem_record = (problem) => {
    console.log(problem);
    return `<tr><td><a target="_blank" href=${problem.url}>${problem.name}<a/></td><td>${problem.proficiency}/5</td><td>${problem.level}</td></tr>`;
}

const create_table_content = (problems) => {
    let content_html = '';
    let keys = Object.keys(problems);
    console.log(keys);
    for (const i of keys) {
        content_html += create_problem_record(problems[i]) + '\n';
    }
    return content_html;
}

const display_table = () => {
    chrome.storage.local.get("problems", (problems) => {
        console.log(problems.problems);
        document.getElementById("table_area").innerHTML = create_table_content(problems.problems);
    })
}

display_table();