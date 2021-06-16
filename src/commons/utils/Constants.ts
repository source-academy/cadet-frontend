import moment, { Moment } from 'moment';

function isTrue(value?: string): boolean {
  return typeof value === 'string' && value.toUpperCase() === 'TRUE';
}

const isTest = process.env.NODE_ENV === 'test';

const sourceAcademyVersion = process.env.REACT_APP_VERSION || 'local';
const sourceAcademyEnvironment = process.env.REACT_APP_ENVIRONMENT || 'dev';
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const cadetLoggerUrl = isTest ? undefined : process.env.REACT_APP_CADET_LOGGER;
const cadetLoggerInterval = parseInt(process.env.REACT_APP_CADET_LOGGER_INTERVAL || '10000', 10);
const useBackend = !isTest && isTrue(process.env.REACT_APP_USE_BACKEND);
const defaultSourceChapter = 4;
const defaultSourceVariant = 'default';
const defaultQuestionId = 0;
const maxBrowseIndex = 50;
const mobileBreakpoint = 768;
const urlShortener = process.env.REACT_APP_URL_SHORTENER_DOMAIN;
const urlShortenerSignature = process.env.REACT_APP_URL_SHORTENER_SIGNATURE;
const moduleBackendUrl = process.env.REACT_APP_MODULE_BACKEND_URL || 'modules';
const sharedbBackendUrl = process.env.REACT_APP_SHAREDB_BACKEND_URL || '';
const playgroundOnly = !isTest && isTrue(process.env.REACT_APP_PLAYGROUND_ONLY);
const enableGame = isTest || isTrue(process.env.REACT_APP_ENABLE_GAME);
const enableAchievements = isTest || isTrue(process.env.REACT_APP_ENABLE_ACHIEVEMENTS);
const enableGitHubAssessments = isTest || isTrue(process.env.REACT_APP_ENABLE_GITHUB_ASSESSMENTS);
const sentryDsn = process.env.REACT_APP_SENTRY_DSN;
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const googleAppId = process.env.REACT_APP_GOOGLE_APP_ID;
const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID || '';
const githubOAuthProxyUrl = process.env.REACT_APP_GITHUB_OAUTH_PROXY_URL || '';
const interactiveSicpDataUrl =
  process.env.REACT_APP_INTERACTIVE_SICP_DATA_URL || 'https://source-academy.github.io/sicp/'; // data for interactive-sicp (images and json files)

const authProviders: Map<string, { name: string; endpoint: string; isDefault: boolean }> =
  new Map();

for (let i = 1; ; ++i) {
  const id = process.env[`REACT_APP_OAUTH2_PROVIDER${i}`];
  if (!id) {
    break;
  }

  const name = process.env[`REACT_APP_OAUTH2_PROVIDER${i}_NAME`] || 'Unnamed provider';
  const endpoint = process.env[`REACT_APP_OAUTH2_PROVIDER${i}_ENDPOINT`] || '';

  authProviders.set(id, { name, endpoint, isDefault: i === 1 });
}

const disablePeriods: Array<{ start: Moment; end: Moment; reason?: string }> = [];

if (!isTest) {
  for (let i = 1; ; ++i) {
    const startStr = process.env[`REACT_APP_DISABLE${i}_START`];
    const endStr = process.env[`REACT_APP_DISABLE${i}_END`];
    if (!startStr || !endStr) {
      break;
    }
    const reason = process.env[`REACT_APP_DISABLE${i}_REASON`];
    const start = moment(startStr);
    const end = moment(endStr);
    if (end.isBefore(start) || moment().isAfter(end)) {
      continue;
    }
    disablePeriods.push({ start, end, reason });
  }
}

export enum Links {
  githubIssues = 'https://github.com/source-academy/cadet-frontend/issues',
  githubOrg = 'https://github.com/source-academy',

  moduleDetails = 'https://www.comp.nus.edu.sg/~cs1101s',
  luminus = 'https://luminus.nus.edu.sg/modules/41d42e9a-5880-43b5-8ee6-75f5a41355e3/announcements/active',
  piazza = 'https://piazza.com/class/kas136yscf8605',

  sourceAcademyAssets = 'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com',
  sourceDocs = 'https://source-academy.github.io/source/',
  techSVC = 'mailto:techsvc@comp.nus.edu.sg',
  techSVCNumber = '6516 2736',
  textbook = 'https://source-academy.github.io/interactive-sicp/',
  textbookChapter2_2 = 'https://source-academy.github.io/interactive-sicp/2.2',
  textbookChapter3_2 = 'https://source-academy.github.io/interactive-sicp/3.2',

  aceHotkeys = 'https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts',
  sourceHotkeys = 'https://github.com/source-academy/cadet-frontend/wiki/Source-Academy-Keyboard-Shortcuts',

  source_1 = 'https://source-academy.github.io/source/source_1/',
  source_1_Lazy = 'https://source-academy.github.io/source/source_1_lazy/',
  source_1_Wasm = 'https://source-academy.github.io/source/source_1_wasm/',
  source_2 = 'https://source-academy.github.io/source/source_2/',
  source_2_Lazy = 'https://source-academy.github.io/source/source_2_lazy/',
  source_3 = 'https://source-academy.github.io/source/source_3/',
  source_3_Concurrent = 'https://source-academy.github.io/source/source_3_concurrent/',
  source_3_Nondet = 'https://source-academy.github.io/source/source_3_non-det/',
  source_4 = 'https://source-academy.github.io/source/source_4/',
  source_4_Gpu = 'https://source-academy.github.io/source/source_4_gpu/'
}

const Constants = {
  sourceAcademyVersion,
  sourceAcademyEnvironment,
  backendUrl,
  cadetLoggerUrl,
  useBackend,
  defaultSourceChapter,
  defaultSourceVariant,
  defaultQuestionId,
  maxBrowseIndex,
  mobileBreakpoint,
  urlShortener,
  urlShortenerSignature,
  moduleBackendUrl,
  authProviders,
  playgroundOnly,
  enableGame,
  enableAchievements,
  enableGitHubAssessments,
  sentryDsn,
  googleClientId,
  googleApiKey,
  googleAppId,
  githubClientId,
  githubOAuthProxyUrl,
  sharedbBackendUrl,
  disablePeriods,
  cadetLoggerInterval,
  interactiveSicpDataUrl
};

export default Constants;
