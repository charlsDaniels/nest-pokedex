import { IsString, IsInt, IsPositive, Min, MinLength } from "class-validator"

export class CreatePokemonDto {
  
  @IsInt()
  @IsPositive()
  @Min(1)
  no: number

  @IsString({ message: 'name debe ser un string'})
  @MinLength(1)
  name: string
  
}
