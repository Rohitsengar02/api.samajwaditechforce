const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
console.log('Checking .env at:', envPath);

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const emailLines = lines.filter(line => line.startsWith('EMAIL_'));

    console.log('--- raw file content check ---');
    if (emailLines.length === 0) {
        console.log('No lines starting with EMAIL_ found in file.');
    } else {
        emailLines.forEach(l => console.log(l));
    }

    console.log('--- dotenv parse check ---');
    const config = dotenv.config();
    if (config.error) {
        console.log('Dotenv parse error:', config.error);
    } else {
        console.log('Parsed EMAIL_USER:', process.env.EMAIL_USER);
        console.log('Parsed EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '****** (exists)' : 'Missing');
    }

} else {
    console.log('.env file NOT FOUND');
}
