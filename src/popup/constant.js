const forggetingCurve = [
    1 * 24 * 60,    // 1 day
    2 * 24 * 60,    // 2 day
    4 * 24 * 60,    // 4 day
    7 * 24 * 60,    // 7 day
    15 * 24 * 60    // 15 day
];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAGE_SIZE = 5;

const input0DOM = document.getElementById("pageInput0");
const inputLabel0DOM = document.getElementById("pageInputLabel0");
const prevButton0DOM = document.getElementById("prevButton0");
const nextButton0DOM = document.getElementById("nextButton0");

const input1DOM = document.getElementById("pageInput1");
const inputLabel1DOM = document.getElementById("pageInputLabel1");
const prevButton1DOM = document.getElementById("prevButton1");
const nextButton1DOM = document.getElementById("nextButton1");

const input2DOM = document.getElementById("pageInput2");
const inputLabel2DOM = document.getElementById("pageInputLabel2");
const prevButton2DOM = document.getElementById("prevButton2");
const nextButton2DOM = document.getElementById("nextButton2");
