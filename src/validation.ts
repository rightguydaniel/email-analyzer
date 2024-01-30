/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */
import fs from 'fs';
import emailValidator from 'email-validator';
import dns, { resolve } from 'dns';

async function validateEmailAddresses(inputPath: string[], outputFile: string) {
  //reading input file
  const data = fs.readFileSync(`${inputPath}`, 'utf-8');
  const validEmailFormat = [];
  const mainArr = data.split('\n');
  const validEmails = [];
  mainArr.shift();
  mainArr.pop();
  let validE = '';
  //extracting all valid email format to a different array
  for (let i = 0; i < mainArr.length; i++) {
    if (emailValidator.validate(mainArr[i]) === true) {
      validEmailFormat.push(mainArr[i]);
    }
  }
  //function to check for valid email addresses
  function emailchecker(email: string) {
    const domain = email.split('@');
    return new Promise<void>((resolve, reject) => {
      dns.resolveMx(domain[1], (err, addresses) => {
        if (err === null) {
          validEmails.push(email);
        }
        console.log({
          err,
          addresses,
        });
        resolve();
      });
    });
  }
  //checking if valid email format has an MX record
  for (let i = 0; i < validEmailFormat.length; i++) {
    await emailchecker(validEmailFormat[i]);
  }
  validEmails.unshift('Emails');
  validE = validEmails.join('\n');
  //writing final output into another file
  fs.writeFile(outputFile, validE, 'utf-8', (err) => {
    err ? console.log(err) : console.log('result saved');
  });
}
validateEmailAddresses(
  ['../task-two/fixtures/inputs/small-sample.csv'],
  'validated-emails.csv',
);
export default validateEmailAddresses;
