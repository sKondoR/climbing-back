import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateRouteImgDto } from './dto/create-route-img.dto';
import { UpdateRouteImgDto } from './dto/update-route-img.dto';
import { RouteImgsService } from './route-imgs.service';
import { ISearchRoute } from './route-imgs.interfaces';

@Controller('route-imgs')
export class RouteImgsController {
  constructor(private readonly routeImgsService: RouteImgsService) {}

  // @Post()
  // async create(@Body() searchRoute: ISearchRoute) {
  //   const routeImg = await this.routeImgsService.getRouteImgByName(searchRoute);
  //   return this.routeImgsService.create(routeImg);
  // }

  // @Get()
  // findAll() {
  //   return this.routeImgsService.findAll();
  // }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const routeImg = await this.routeImgsService.findOne(id);
    if ('imageData' in routeImg && routeImg.imageData) {
      return {
        ...routeImg,
        imageData: routeImg.imageData.toString('base64'),
      }
    }
    return routeImg;
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRouteImgDto: UpdateRouteImgDto) {
  //   return this.routeImgsService.update(id, updateRouteImgDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.routeImgsService.remove(+id);
  // }
}
