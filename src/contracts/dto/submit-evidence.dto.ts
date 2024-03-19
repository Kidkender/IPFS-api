import { IsNotEmpty } from 'class-validator';
import { VALIDATE_EVIDENCE_HASH_REQUIRED } from 'constant';

export class SubmitEvidenceDto {
  @IsNotEmpty({ message: VALIDATE_EVIDENCE_HASH_REQUIRED })
  cidFolder: string;
}
