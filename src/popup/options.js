import './popup.css';
import { setProblemSorter } from "./service/configService";
import { optionPageFeedbackMsgDOM } from './util/doms';
import { descriptionOf, idOf, problemSorterArr } from "./util/sort";

document.addEventListener('DOMContentLoaded', () => {
    const optionsForm = document.getElementById('optionsForm');
    const problemSorterSelect = document.getElementById('problemSorterSelect');
    const problemSorterMetaArr = problemSorterArr.map(sorter => {
        return {id: idOf(sorter), text: descriptionOf(sorter)};
    });


    problemSorterMetaArr.forEach(sorterMeta => {
        const optionElement = document.createElement('option');
        optionElement.value = sorterMeta.id;
        optionElement.textContent = sorterMeta.text;
        problemSorterSelect.append(optionElement);
    })

    optionsForm.addEventListener('submit', async e => {
        e.preventDefault();
        const selectedSorterId = problemSorterSelect.value;
        await setProblemSorter(Number(selectedSorterId));
        optionPageFeedbackMsgDOM.style.display = 'block';
        setTimeout(() => optionPageFeedbackMsgDOM.style.display = 'none', 1000);
    })
});