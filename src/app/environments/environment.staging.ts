

export enum BackendURL {
    Local = 'http://localhost:60397/v1/sismaanaimcia/',
    Staging = 'http://sismaanaim.cantina.local.api.hml:5000/v1/sismaanaim/'
  }



  export enum KEYCLOAKURL {
    Staging= 'https://keycloak.berechit.com.br',
    Local = 'https://localhost/'
  }


  export enum KEYCLOAKREALM {
    Local = 'SisMaanaim',
    Prod = 'SisMaanaim',
    Staging = 'SisMaanaim'
  }

  export enum KEYCLOAKCLIENTID {
    Local = 'SisMaanaim',
    Prod = 'SisMaanaim',
    Staging = 'SisMaanaim'
  }


  export enum Checkout_URL {
      Local= 'http://localhost:4200',
      Prod = 'http://checkout.sismaanaim.com.br/',
  }

  export const environment = {
    API_URL:BackendURL.Staging,
    production: false,
    KEYCLOAK_URL:KEYCLOAKURL.Staging,
    KEYCLOAK_REALM: KEYCLOAKREALM.Local,
    KEYCLOAK_CLIENTID: KEYCLOAKCLIENTID.Local,
    Checkout_URL: Checkout_URL.Prod
  };

  // const keycloakConfig = {
  //   url: , // Keycloak server URL
  //   realm: '<your-realm>',               // Your Keycloak realm
  //   clientId: '<your-client-id>',        // Your Keycloak client ID
  // };

  // export const keycloak = new Keycloak(keycloakConfig);
