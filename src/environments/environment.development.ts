export const environment = {
  production: false,
  apiUrl: 'https://localhost:7098/api/',
  ecsApiUrl: 'https://localhost:7012/api/',
  msal: {
    clientId: 'a23f820f-9edc-49ae-acd6-44c32aa407ab',
    authority: 'https://login.microsoftonline.com/9eaf4a76-636b-4097-95a1-35a97c469ea1',
    redirectUri: 'http://localhost:4200',
    scopes: ['api://a23f820f-9edc-49ae-acd6-44c32aa407ab/default']
  }
};
