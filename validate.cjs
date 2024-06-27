const fs = require('fs').promises;
const path = require('path');

/**
 * @typedef {Object} Data
 * @property {string} question
 * @property {string} solution
 * @property {"HARD" | "MEDIUM" | "EASY"} difficulty
 * @property {string} [source]
 * @property {string} [hints]
 * @property {string} [coverImage]
 */

/**
 * @typedef {Object} MetaData
 * @property {number} length
 * @property {string} type
 * @property {string} name
 * @property {string} description
 * @property {string} email
 * @property {string} [twitter]
 * @property {string} [github]
 * @property {string} [youtube]
 * @property {string} [discord]
 */

/**
 * Validates metadata structure
 * @param {Object} metadata 
 * @returns {string|null} Error message or null if valid
 */
function validateMetadata(metadata) {
    const requiredFields = ['length', 'type', 'name', 'description', 'email'];
    const optionalFields = ['twitter', 'github', 'youtube', 'discord'];
    
    for (const field of requiredFields) {
        if (!(field in metadata)) {
            return `Missing required field: ${field}`;
        }
    }

    for (const key of Object.keys(metadata)) {
        if (!requiredFields.includes(key) && !optionalFields.includes(key)) {
            return `Unexpected field in metadata: ${key}`;
        }
    }

    if (typeof metadata.length !== 'number') {
        return `'length' field must be a number, got ${typeof metadata.length}`;
    }

    if (typeof metadata.type !== 'string') {
        return `'type' field must be a string, got ${typeof metadata.type}`;
    }

    return null;
}

/**
 * Validates data structure
 * @param {Object} data 
 * @returns {string|null} Error message or null if valid
 */
function validateData(data) {
    const requiredFields = ['question', 'solution', 'difficulty'];
    const optionalFields = ['source', 'hints', 'coverImage'];
    const validDifficulties = ['HARD', 'MEDIUM', 'EASY'];
    
    for (const field of requiredFields) {
        if (!(field in data)) {
            return `Missing required field: ${field}`;
        }
    }

    for (const key of Object.keys(data)) {
        if (!requiredFields.includes(key) && !optionalFields.includes(key)) {
            return `Unexpected field in data: ${key}`;
        }
    }

    if (!validDifficulties.includes(data.difficulty)) {
        return `Invalid difficulty: '${data.difficulty}'. Must be one of ${validDifficulties.join(', ')}`;
    }

    return null;
}

/**
 * Validates the project structure
 */
async function validateProjectStructure() {
    try {
        // Validate index.json (metadata)
        let metadataRaw;
        try {
            metadataRaw = await fs.readFile('index.json', 'utf8');
        } catch (error) {
            console.error("Error: Unable to read index.json. Make sure the file exists in the root directory.");
            return false;
        }

        let metadata;
        try {
            metadata = JSON.parse(metadataRaw);
        } catch (error) {
            console.error("Error: index.json is not a valid JSON file. Please check its format.");
            return false;
        }
        
        const metadataError = validateMetadata(metadata);
        if (metadataError) {
            console.error(`Error in index.json: ${metadataError}`);
            return false;
        }
        
        const expectedLength = metadata.length;

        // Validate data files
        const dataDir = 'data';
        let dataFiles;
        try {
            dataFiles = await fs.readdir(dataDir);
        } catch (error) {
            console.error(`Error: Unable to read 'data' directory. Make sure it exists in the root directory.`);
            return false;
        }
        const jsonFiles = dataFiles.filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length !== expectedLength) {
            console.error(`Error: Number of data files (${jsonFiles.length}) does not match metadata length (${expectedLength})`);
            return false;
        }

        for (let i = 0; i < expectedLength; i++) {
            const filename = `${i}.json`;
            const filepath = path.join(dataDir, filename);
            
            let dataRaw;
            try {
                dataRaw = await fs.readFile(filepath, 'utf8');
            } catch (error) {
                console.error(`Error: Unable to read ${filename}. Make sure the file exists in the 'data' directory.`);
                return false;
            }

            let data;
            try {
                data = JSON.parse(dataRaw);
            } catch (error) {
                console.error(`Error: ${filename} is not a valid JSON file. Please check its format.`);
                return false;
            }
            
            const dataError = validateData(data);
            if (dataError) {
                console.error(`Error in ${filename}: ${dataError}`);
                return false;
            }
        }

        console.log("Validation successful: All files and data structures are correct");
        return true;
    } catch (error) {
        console.error("An unexpected error occurred during validation:", error.message);
        return false;
    }
}

validateProjectStructure().then(result => {
    process.exit(result ? 0 : 1);
});
