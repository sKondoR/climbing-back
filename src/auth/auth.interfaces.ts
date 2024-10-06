export interface JwtPayloadInterface {
  id: number;
}

export interface AuthVKEntity {
  code: string;
  device_id: string;
  state: string;
  code_verifier: string;
}
