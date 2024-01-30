/* eslint-disable no-prototype-builtins */
/**
 * First task - Read the csv files in the inputPath and analyse them
 *
 * @param {string[]} inputPaths An array of csv files to read
 * @param {string} outputPath The path to output the analysis
 */
import fs from 'fs';
import emailValidator from 'email-validator';
import dns, { resolve } from 'dns';

async function analyseFiles(inputPaths: string[], outputPath: string) {
  let totalEmailsParsed = [];
  let totalValidEmails = [];
  const validEmailFormat: string[] = [];
  const validDomains: string[] = [];
  const validEmails: string[] = [];
  const categories: Record<string, number> = {};
  //reading input file
  const data = fs.readFileSync(`${inputPaths}`, 'utf-8');
  let uniqueValidDomains: string[] = [];
  // console.log(data);
  const mainArr = data.split('\n');
  mainArr.shift();
  mainArr.pop();
  //to check the length of total emails
  totalEmailsParsed = [...mainArr];
  //to check for valid email format
  for (let i = 0; i < mainArr.length; i++) {
    if (emailValidator.validate(mainArr[i]) === true) {
      validEmailFormat.push(mainArr[i]);
    }
  }
  totalValidEmails = [...validEmailFormat];
  //function to check if a domain has an MX record
  function emailchecker(email: string) {
    const domain = email.split('@');
    return new Promise<void>((resolve, reject) => {
      dns.resolveMx(domain[1], (err, addresses) => {
        if (err === null) {
          validEmails.push(email);
          validDomains.push(domain[1]);
        }
        console.log({
          err,
          addresses,
        });
        resolve();
      });
    });
  }
  //looping through all valid email format to check if they have an MX record(ie can record mail)
  for (let i = 0; i < validEmailFormat.length; i++) {
    await emailchecker(validEmailFormat[i]);
  }
  //valid domains no repeat
  uniqueValidDomains = [...new Set(validDomains)];
  //checking for categories of mails
  const categoryArr = [];
  for (let i = 0; i < validEmailFormat.length; i++) {
    const domainName = validEmailFormat[i].split('@');
    categoryArr.push(domainName[1]);
  }
  for (let i = 0; i < validEmailFormat.length; i++) {
    categories.hasOwnProperty(categoryArr[i])
      ? categories[categoryArr[i]]++
      : (categories[categoryArr[i]] = 1);
  }
  //final output
  const output = {
    'valid-domains': [...uniqueValidDomains],
    totalEmailsParsed: totalEmailsParsed.length,
    totalValidEmails: totalValidEmails.length,
    categories: categories,
  };
  //writing file output to another file
  fs.writeFile(outputPath, JSON.stringify(output), 'utf-8', (err) => {
    err ? console.log(err) : console.log('result saved');
  });
}

analyseFiles(['../task-two/fixtures/inputs/small-sample.csv'], 'analysis.json');
export default analyseFiles;
