import { DateTime } from "luxon";

export interface DetalhePix {
    cobrancaId: string,
    dataExpiracao: DateTime,
    estadoCobranca: number,
    codigo: string,
    qrCodeImage: string,
    valorCentavos: number,
    membro: string,
    evento: string,
    classe: string,
    getStatusCobranca:string
}
