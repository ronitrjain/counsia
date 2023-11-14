import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };
import fs from 'fs';


//create a forloop to iterate through the json file and create a new array with the names of the universities


const names = [];
for (let i = 0; i < world_universities.length; i++) {
    names.push(world_universities[i].slice(0, -5));
}


console.log(JSON.stringify(names));


fs.writeFile('world-universities.json', JSON.stringify(names), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
});








