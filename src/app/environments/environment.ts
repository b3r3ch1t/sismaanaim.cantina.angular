

export enum BackendURL {
  Local = 'http://localhost:55328/v1/sismaanaim/',
  Staging = 'http://172.17.136.253:5010/v1/sismaanaim/',
  Prod = 'http://149.255.39.117:5010/v1/sismaanaim/',

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
  API_URL:BackendURL.Local,
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
