const fs = require('fs/promises');
/**
 * @param {number} id 
 * @returns {string}
 */
const makeUrl = (id) => {
    return `https://projecteuler.net/minimal=${id}`;
};

/**
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * @param {number} id 
 * @returns {Promise<void>}
 */
async function fetchProblem(id) {
    const url = makeUrl(id);
    try {
        const response = await fetch(url);
        const text = await response.text();
        await fs.writeFile(`./data/${id}.json`, JSON.stringify({ question: text, answer: "" }));
        console.log("Problem", id, "fetched");
    } catch (error) {
        console.error(`Error fetching problem ${id}:`, error);
    }
}

/**
 * @param {number} start 
 * @param {number} end 
 * @returns {Promise<void>}
 */
async function fetchProblems(start, end) {
    for (let id = start; id <= end; id++) {
        await fetchProblem(id);
        await sleep(5000); // Wait for 5 seconds before the next request
    }
}

// Usage
fetchProblems(30, 40).then(() => console.log('All problems fetched'));