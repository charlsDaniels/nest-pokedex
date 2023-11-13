import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  )
  {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const defaultLimit = this.configService.get<number>('defaultPageLimit')

    const { limit = defaultLimit, offset = 0 } = paginationDto

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v'); // se puede elegir la proyección de la query, el signo menos adelante para excluir propiedades
  }

  async findOne(term: string) {
    let pokemon: Pokemon

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term)
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)
    }

    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)

    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto }

    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if (deletedCount === 0) 
      throw new BadRequestException(`Pokemon with id ${id} doesn´t exists`)      

    return

    // const result = await this.pokemonModel.findByIdAndDelete(id)

    // if (!result) 
    //   throw new BadRequestException(`Pokemon with id ${id} doesn´t exists`)      
    // 

    // return result
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException(`Can't create Pokemon - check server logs`)
  }
}
