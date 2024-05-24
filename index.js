import { readFileSync, writeFileSync } from 'fs';

// Read files
let data = readFileSync('Kommuner-S.geojson', 'utf8');
let municipalities = JSON.parse(data);

let municipalitiesToKeep = readFileSync('kommuner-input.csv', 'utf8');
let lines = municipalitiesToKeep.split('\n');

let matchingNames = [];
let namesToKeep = lines
    .filter(line => line.trim() !== '' && !line.trim().startsWith('#'))
    .map(line => line.trim().replace(" kommune", ""));

// Filter and highlight
municipalities.features.forEach(feature => {
    let kommunenavnParts = feature.properties.kommunenavn.split(' - '); // May include Sami or Kven names
    let matchingName = kommunenavnParts.find(part => namesToKeep.includes(part)); 
    
    feature.properties = {
        ...feature.properties,
        "stroke": "#000000",
        "stroke-width": 0.5,
        "stroke-opacity": 1,
        "fill-opacity": 0.5,
    };
    
    if (matchingName) {
        feature.properties["fill"] = "#0000ff";
        matchingNames.push(matchingName);
    } else {
        feature.properties["fill"] = "#ffffff";
    }
});

// Write to files
matchingNames.sort();
writeFileSync('matching_names.csv', matchingNames.join('\n'), 'utf8');

let output = JSON.stringify(municipalities);
writeFileSync('kommuner_output.geojson', output, 'utf8');

// Console output
let nonMatchingNames = namesToKeep.filter(name => !matchingNames.includes(name));
console.log(`Number of matching municipalities: ${matchingNames.length}`);
console.log(`Number of excluded municipalities: ${nonMatchingNames.length}`);
console.log('\nExcluded municipalities: \n' + nonMatchingNames.join('\n'));