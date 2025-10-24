import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Match} from "./match.schema";

@Injectable()
export class MatchService {
  constructor(@InjectModel(Match.name) private readonly matchModel: Model<Match>) {}
}
