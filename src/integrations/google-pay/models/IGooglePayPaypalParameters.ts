interface IGooglePayPaypalPurchaseUnit {
  payee: {
    merchant_id: string;
  };
}

interface IGooglePayPaypalPurchaseContext {
  purchase_units: IGooglePayPaypalPurchaseUnit;
}

export interface IGooglePayPaypalParameters {
  purchase_context: IGooglePayPaypalPurchaseContext;
}
