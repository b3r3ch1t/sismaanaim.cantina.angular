

export enum BackendURL {
    Local = 'http://localhost:60397/v1/sismaanaimcia/',
    Staging = 'api/v1/sismaanaim/'
  }




  export enum Checkout_URL {
      Local= 'http://localhost:4200',
      Prod = 'http://checkout.sismaanaim.com.br/',
  }

  export const environment = {
    API_URL:BackendURL.Staging,
    production: false,
    Checkout_URL: Checkout_URL.Prod
  };

  // const keycloakConfig = {
  //   url: , // Keycloak server URL
  //   realm: '<your-realm>',               // Your Keycloak realm
  //   clientId: '<your-client-id>',        // Your Keycloak client ID
  // };

  // export const keycloak = new Keycloak(keycloakConfig);
