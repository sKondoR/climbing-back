import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteImgDto } from './create-route-img.dto';

export class UpdateRouteImgDto extends PartialType(CreateRouteImgDto) {}
