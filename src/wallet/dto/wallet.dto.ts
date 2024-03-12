export class WalletResponseDto {
  id: number;
  userId: number;
  address: string;
  phrase: string;
  balance: bigint | number;
  createdAt: Date;
}
