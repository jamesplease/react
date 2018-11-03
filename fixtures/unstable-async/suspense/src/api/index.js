import {
  coreContributorListJSON,
  userProfileJSON,
  userRepositoriesListJSON,
} from './data';

export function fetchCoreContributorListJSON() {
  return makeFakeAPICall('/react/contributors', coreContributorListJSON, 1000);
}

export function fetchUserProfileJSON(id) {
  return makeFakeAPICall(`/${id}/details`, userProfileJSON[id], 3000);
}

export function fetchUserRepositoriesListJSON(id) {
  return makeFakeAPICall(`/${id}/repositories`, userRepositoriesListJSON[id], 5000);
}

let requestTimeMultipler = 1;
let onProgress = () => true;

export function setFakeRequestTime(val) {
  requestTimeMultipler = val;
}

export function setProgressHandler(handler) {
  onProgress = handler;
}

export function setPauseNewRequests(value) {
  shouldPauseNewRequests = value;
}

let shouldPauseNewRequests = false;
let notifiers = {};
let isPausedUrl = {};

export function setPaused(url, isPaused) {
  const wasPaused = isPausedUrl[url];
  isPausedUrl[url] = isPaused;
  if (isPaused !== wasPaused) {
    notifiers[url]();
  }
}

function makeFakeAPICall(url, result, fakeRequestTime = 1000) {
  let i = 1;
  return new Promise(resolve => {
    isPausedUrl[url] = shouldPauseNewRequests;
    function notify() {
      if (!isPausedUrl[url]) {
        i++;
      }
      const networkTime = fakeRequestTime * requestTimeMultipler;

      let progressValue = networkTime > 0 ? i : 100;
      onProgress(url, progressValue, isPausedUrl[url]);
      if (isPausedUrl[url]) {
        return;
      }

      if (i === 100 || networkTime === 0) {
        resolve(result);
      } else {
        setTimeout(notify, networkTime / 100);
      }
    }
    notifiers[url] = notify;
    notify();
  });
}
