#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { argv, stdout } from 'process';
import { Project } from 'ts-morph';

const translateMethodName = 'translate';
const translationDir = 'src/translations/json/';

function getSourceFiles() {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });
  project.addDirectoryAtPathIfExists('../src');

  return project.getSourceFiles();
}

function getClasses() {
  // we assume one class per file
  return getSourceFiles().filter(f => f.getClasses()?.length).map(f => f.getClasses()[0]);
}

function getMethodArgument(node) {
  // when node is function name
  // node.getParents.getNextSiblings() returns opening brace, argument, and closing brace after translate
  return node.getParent()?.getNextSiblings().filter(s => s.getKindName() === 'SyntaxList')[0];
}

// function hasValueAssigned(node) {
//   return node?.getFirstChild()?.getSymbol()?.getDeclarations ? node.getFirstChild().getSymbol().getDeclarations().length : null;
// }

function isStringLiteral(node) {
  return node?.getFirstChild()?.getKindName() === 'StringLiteral';
}

function isTransateMethodCall(node) {

  const isNamedTranslate = node.getSymbol()?.getEscapedName() === translateMethodName;
  const isNotMethodDeclaration = node.getParent().getKindName() !== 'MethodDeclaration';

  return isNamedTranslate && isNotMethodDeclaration;
}

function getAllNodes() {
  const allNodes = [];

  getClasses().forEach(classDeclaration => classDeclaration.forEachDescendant(child => {
    allNodes.push(child);
  }));

  return allNodes;
}

function getRawStringTranslationsFromCode() {
  return getAllNodes()
    .filter(isTransateMethodCall)
    .map(getMethodArgument)
    .filter(isStringLiteral)
    .map(node => node.getFirstChild()?.getText({
        includeJsDocComments: false,
        trimLeadingIndentation: true,
      }).replace(/['"]/g, '')
    );
}

// const trans = require(translationDir);
async function notAdded() {
  const translationsFromFile = JSON.parse(fs.readFileSync(`${translationDir}en_GB.json`, { encoding: 'utf-8' }));
  const translationsFromCode = getRawStringTranslationsFromCode();
  const translationsNotInFile = Object.fromEntries(translationsFromCode
    .filter(key => !translationsFromFile[key]
    ).map(key => [key, key]));

  stdout.write('Translations used in code (as plain strings), but not present in translation file:\n\n');
  stdout.write(JSON.stringify(translationsNotInFile, null, 2));
  stdout.write('\n\n');
}

function checkLanguages() {
  // const englishTranslations = JSON.parse(fs.readFileSync(`${translationDir /}en_GB.json`, { encoding: 'utf-8' }));
  const supportedLanguages = ['cy_GB.json',
    'da_DK.json',
    'de_DE.json',
    'en_GB.json',
    'en_US.json',
    'es_ES.json',
    'fr_FR.json',
    'it_IT.json',
    'nl_NL.json',
    'no_NO.json',
    'sv_SE.json'];
  let allTranslations = {};
  supportedLanguages
    .forEach(fileName =>
      allTranslations[fileName] = JSON.parse(fs.readFileSync(`${translationDir}${fileName}`, { encoding: 'utf-8' })));
  const translationCoverage = {};

  Object.keys(allTranslations['en_GB.json']).map(key => {
    translationCoverage[key] = {};
    return supportedLanguages.forEach(lang => {
      translationCoverage[key][lang] = Boolean(allTranslations[lang][key]);
    });
  });

  Object.keys(translationCoverage).forEach(key => {

    stdout.write(`\x1b[0m${key}\n`);
    const langs = Object.keys(translationCoverage[key]);
    const notTranslatedLangs = langs.filter(lang => {
      return !translationCoverage[key][lang];
    });
    if (notTranslatedLangs.length === 0) {
      console.log('\x1b[32mTranslated\x1b[89m');
    } else {
      console.log(`\x1b[31mMissing translations (${notTranslatedLangs.length}):\n\t${notTranslatedLangs.join('\n\t')}\x1b[89m`);
    }
    stdout.write('\n');
  });
}

function help() {
  stdout.write('<command> required\n');
  stdout.write('Available commands:\n');
  stdout.write('\tmissing - list used translations not added to translation files\n');
  stdout.write('\tcoverage - check translations coverage for all languages\n');
}

switch (argv[2]) {
  case 'missing':
    notAdded();
    break;
  case 'coverage':
    checkLanguages();
    break;
  default:
    help();
}

