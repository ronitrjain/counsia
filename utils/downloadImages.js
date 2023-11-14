import axios from 'axios';
import fs from 'fs';


import world_universities from '../public/assets/json/world-universities.json' assert { type: 'json' };

// URL of the image you want to download


// Function to download and save the image
async function downloadImage(name_unformat) {
    try {
        // Send an HTTP GET request to the image URL
        //replace _ with space

        let name = name_unformat.replaceAll(' ', '+');

        const imageUrl = `https://ui-avatars.com/api/?name=${name}&bold=true&size=400&background=4A7AF5&color=fff`;
        const response = await axios.get(imageUrl, { responseType: 'stream' });

        // Check if the request was successful (status code 200)
        if (response.status === 200) {
            // Determine the file name from the URL (optional)
            const fileName = `${name.replaceAll('+', "_")}.png`;

            // Create a writable stream to save the image
            const filePath = "/Users/moksh/Desktop/WebProjects/collegeconnect/public/assets/img/Colleges/" + fileName
            const writer = fs.createWriteStream(filePath);

            // Pipe the response data (image) into the writable stream
            response.data.pipe(writer);

            // Wait for the stream to finish writing the image
            await new Promise((resolve) => writer.on('finish', resolve));

            console.log(`Image downloaded and saved as "${fileName}"`);
        } else {
            console.error('Failed to download the image. Status code:', response.status);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}


//get all images in /Users/moksh/Desktop/WebProjects/collegeconnect/public/assets/img/Colleges
const directoryPath = "/Users/moksh/Desktop/WebProjects/collegeconnect/public/assets/img/Colleges";
let files_ = []

fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(async function (file) {
        // Do whatever you want to do with the file
        const name = file.split('.')[0];

        const name_unformat = name.replaceAll('_', ' ');
        files_.push(name_unformat);


    });


    console.log(files_.length)
    console.log(world_universities.length)

    let count = 0;


    async function createImages() {
        for (let i = 0; i < world_universities.length; i++) {
            const name = world_universities[i];

            if (!files_.includes(name)) {
                count++;

                try {
                    ;
                } catch (e) {
                    console.log(e)

                }

            }





        }
        console.log(count)
    }

    createImages();



})





