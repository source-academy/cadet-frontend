import * as QueryString from 'query-string';
import { useEffect, useState } from 'react';

import Constants from '../../commons/utils/Constants';
import * as GitHubUtils from '../../features/github/GitHubUtils';

/**
 * The page that the user is redirected to after they have approved the app through GitHub.
 * This page will complete the OAuth workflow by sending the access code the back-end to retrieve the auth-token.
 * The auth-token is then broadcasted back to the main browser page.
 */
export function GitHubCallback() {
  const [message, setMessage] = useState('You have reached the GitHub callback page');

  useEffect(() => {
    const currentAddress = window.location.search;
    const accessCode = GitHubUtils.grabAccessCodeFromURL(currentAddress);

    const clientId = GitHubUtils.getClientId();
    //const backendLink = 'https://api2.sourceacademy.nus.edu.sg/github_oauth';
    const backendLink = Constants.githubOAuthProxyUrl;

    if (accessCode === '') {
      setMessage(
        'Access code not found in callback URL. Please try again or contact the website administrator.'
      );
      return;
    }

    if (clientId === '') {
      setMessage(
        'Client ID not included with deployment. Please try again or contact the website administrator.'
      );
      return;
    }

    const messageBody = QueryString.stringify({
      code: accessCode,
      clientId: clientId
    });

    retrieveAuthTokenUpdatePage(backendLink, messageBody, setMessage);
  }, []);

  return <div>{message}</div>;
}

async function retrieveAuthTokenUpdatePage(
  backendLink: string,
  messageBody: string,
  setMessage: (value: React.SetStateAction<string>) => void
) {
  const responseObject = await GitHubUtils.exchangeAccessCodeForAuthTokenContainingObject(
    backendLink,
    messageBody
  );

  let response: any;

  try {
    // This line might throw syntax error if the payload received is in the wrong format
    response = await responseObject.json();

    if (typeof response.access_token === 'undefined') {
      throw new Error('Access Token not found in payload');
    }
  } catch (err) {
    setMessage(
      'Connection with server was denied, or incorrect payload received. Please try again or contact the website administrator.'
    );
    return;
  }

  setMessage('Log-in successful! This window will close soon.');

  try {
    // Send auth token back to the main browser page
    const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');
    broadcastChannel.postMessage(response.access_token);
  } catch (err) {
    // This block should not be reached during normal running of code
    // However, BroadcastChannel does not exist in the test environment
  }

  setTimeout(() => {
    window.close();
  }, 1000);
}

export default GitHubCallback;
