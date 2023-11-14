import fs from 'fs';
import path from 'path';
// Define the folder containing the image files
const folderPath = './public/assets/img/Colleges';

// Read the files in the folder
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        return;
    }

    // Define a regular expression pattern to match the desired file names
    const pattern = /^([A-Za-z_]+)_\([^)]+\)\.png$/;

    // Iterate through the files and rename them
    files.forEach((file) => {
        const match = file.match(pattern);

        if (match) {
            const newName = `${match[1]}.png`;
            const oldPath = path.join(folderPath, file);
            const newPath = path.join(folderPath, newName);

            // Rename the file
            fs.rename(oldPath, newPath, (renameErr) => {
                if (renameErr) {
                    console.error(`Error renaming ${file}:`, renameErr);
                } else {
                    console.log(`Renamed ${file} to ${newName}`);
                }
            });
        }
    });
});