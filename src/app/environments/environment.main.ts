

export enum BackendURL {
    Local = 'http://localhost:60397/v1/sismaanaimcia/',
    Staging = 'api/v1/sismaanaim/',
    Prod = 'https://api.sismaanaim.com.br/v1/sismaanaimcia/',
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
