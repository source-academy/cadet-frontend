import * as dotenv from 'dotenv';

dotenv.config();

const luminusClientID = process.env.REACT_APP_LUMINUS_CLIENT_ID;
const sourceAcademyVersion = process.env.REACT_APP_VERSION;
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const useBackend =
  process.env.REACT_APP_USE_BACKEND !== undefined &&
  process.env.REACT_APP_USE_BACKEND !== '' &&
  process.env.REACT_APP_USE_BACKEND!.toUpperCase() === 'TRUE';
const useChatkit =
  process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR !== undefined &&
  process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR !== ''; // TODO: Remove
const instanceLocator = process.env.REACT_APP_CHATKIT_INSTANCE_LOCATOR;
const defaultSourceChapter = 4;
const defaultSourceVariant = 'default';
const defaultQuestionId = 0;
const maxBrowseIndex = 50;
const urlShortener = process.env.REACT_APP_URL_SHORTENER_DOMAIN;
const urlShortenerSignature = process.env.REACT_APP_URL_SHORTENER_SIGNATURE;
const moduleBackendUrl =
  process.env.MODULE_BACKEND_URL === undefined || process.env.MODULE_BACKEND_URL === ''
    ? 'modules'
    : process.env.MODULE_BACKEND_URL;

export enum Links {
  githubIssues = 'https://github.com/source-academy/cadet-frontend/issues',
  githubOrg = 'https://github.com/source-academy',

  moduleDetails = 'https://www.comp.nus.edu.sg/~cs1101s',
  luminus = 'https://luminus.nus.edu.sg/modules/b1340bf4-fc99-4898-be2a-2c20e38c065f/announcements/active',
  piazza = 'https://luminus.nus.edu.sg/modules/b1340bf4-fc99-4898-be2a-2c20e38c065f/forum',
  shareDBServer = 'api2.sourceacademy.nus.edu.sg/',
  sourceDocs = 'https://sicp.comp.nus.edu.sg/source/',
  sourceDocsChapter2_2 = 'https://sicp.comp.nus.edu.sg/chapters/29',
  sourceDocsChapter3_2 = 'https://sicp.comp.nus.edu.sg/chapters/52',
  techSVC = 'mailto:techsvc@comp.nus.edu.sg',
  textbook = 'https://sicp.comp.nus.edu.sg/',

  aceHotkeys = 'https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts',
  sourceHotkeys = 'https://github.com/source-academy/cadet-frontend/wiki/Source-Academy-Keyboard-Shortcuts',

  source_1 = 'https://sicp.comp.nus.edu.sg/source/source_1/',
  source_1_Lazy = 'https://sicp.comp.nus.edu.sg/source/source_1_lazy/',
  source_1_Wasm = 'https://sicp.comp.nus.edu.sg/source/source_1_wasm/',
  source_2 = 'https://sicp.comp.nus.edu.sg/source/source_2/',
  source_2_Lazy = 'https://sicp.comp.nus.edu.sg/source/source_2_lazy/',
  source_3 = 'https://sicp.comp.nus.edu.sg/source/source_1/',
  source_3_Concurrent = 'https://sicp.comp.nus.edu.sg/source/source_3_concurrent/',
  source_3_Nondet = 'https://sicp.comp.nus.edu.sg/source/source_3_non-det/',
  source_4 = 'https://sicp.comp.nus.edu.sg/source/source_4/',
  source_4_Gpu = 'https://sicp.comp.nus.edu.sg/source/source_4_gpu/'
}

const Constants = {
  luminusClientID,
  sourceAcademyVersion,
  backendUrl,
  useBackend,
  useChatkit, // TODO: Remove
  instanceLocator,
  defaultSourceChapter,
  defaultSourceVariant,
  defaultQuestionId,
  maxBrowseIndex,
  urlShortener,
  urlShortenerSignature,
  moduleBackendUrl
};

export default Constants;
